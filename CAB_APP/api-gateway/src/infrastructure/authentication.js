"use strict";
const fs = require("node:fs");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
function createAuthentication(env = process.env, redis) {
  const paths = {
    [env.CAB_JWT_ACTIVE_KEY_ID || "v1"]: env.CAB_JWT_PUBLIC_KEY_PATH,
    ...JSON.parse(env.CAB_JWT_PUBLIC_KEY_PATHS || "{}"),
  };
  const keys = Object.fromEntries(
    Object.entries(paths).map(([id, file]) => {
      const key = crypto.createPublicKey(fs.readFileSync(file));
      if (
        key.asymmetricKeyType !== "rsa" ||
        key.asymmetricKeyDetails.modulusLength < 2048
      )
        throw new Error("Invalid RSA public key");
      return [id, key];
    }),
  );
  if (!/^[a-f0-9]{64}$/i.test(env.CAB_AUTH_RATE_KEY || ""))
    throw new Error("Missing auth rate-limit key");
  function verify(req) {
    const authorization = req.get("Authorization");
    if (!authorization || !/^Bearer [^\s]+$/i.test(authorization))
      throw new Error("Authentication required");
    const token = authorization.slice(7);
    if (token.length > 8192) throw new Error("Invalid token");
    const decoded = jwt.decode(token, { complete: true });
    if (
      !decoded ||
      decoded.header.alg !== "RS256" ||
      !Object.hasOwn(keys, decoded.header.kid)
    )
      throw new Error("Invalid token");
    const claims = jwt.verify(token, keys[decoded.header.kid], {
      algorithms: ["RS256"],
      issuer: env.CAB_JWT_ISSUER || "cab-system",
      audience: env.CAB_JWT_AUDIENCE || "cab-public-api",
      maxAge: 1800,
    });
    if (
      claims.tokenUse !== "access" ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
        claims.sub || "",
      ) ||
      !["CUSTOMER", "DRIVER", "STAFF", "ADMIN"].includes(claims.role) ||
      !Number.isInteger(claims.exp) ||
      !Number.isInteger(claims.iat) ||
      claims.exp - claims.iat > 1800 ||
      claims.exp <= claims.iat ||
      claims.iat > Math.floor(Date.now() / 1000) + 30
    )
      throw new Error("Invalid claims");
    return { ...claims, token };
  }
  const script =
    "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return {n,redis.call('TTL',KEYS[1])}";
  const digest = (value) =>
    crypto
      .createHmac("sha256", Buffer.from(env.CAB_AUTH_RATE_KEY, "hex"))
      .update(value)
      .digest("hex");
  async function rateLimit(req, operation) {
    const identities = [["ip:" + req.ip, 60]];
    if (typeof req.body?.phoneNumber === "string") {
      let phone = req.body.phoneNumber.replace(/[\s().-]/g, "");
      if (/^0\d{9}$/.test(phone)) phone = "+84" + phone.slice(1);
      else if (/^\d+$/.test(phone)) phone = "+" + phone;
      identities.push([
        "phone:" + phone,
        [
          "requestCustomerRegistrationOtp",
          "requestDriverRegistrationOtp",
        ].includes(operation)
          ? 5
          : 10,
      ]);
    }
    if (typeof req.body?.email === "string")
      identities.push(["email:" + req.body.email.trim().toLowerCase(), 10]);
    for (const [identity, limit] of identities) {
      const controller = new AbortController(),
        timer = setTimeout(() => controller.abort(), 300);
      try {
        const [count, ttl] = await redis
          .withCommandOptions({ abortSignal: controller.signal })
          .eval(script, {
            keys: ["cab:auth:" + operation + ":" + digest(identity)],
            arguments: ["60"],
          });
        if (count > limit)
          return { allowed: false, retryAfter: Math.max(1, ttl) };
      } finally {
        clearTimeout(timer);
      }
    }
    return { allowed: true };
  }
  return { verify, rateLimit };
}
module.exports = { createAuthentication };
