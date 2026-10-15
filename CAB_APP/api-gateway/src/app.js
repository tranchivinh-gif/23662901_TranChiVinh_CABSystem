"use strict";
const express = require("express");
const { randomUUID } = require("node:crypto");
const { targets } = require("./infrastructure/grpc-clients");
const { registerRoutes } = require("./api/routing");
const { sendError } = require("./api/errors");
const { registerAuthRoutes } = require("./api/auth");
const { registerLookupRoutes } = require("./api/lookup");
const { registerDriverRegistration } = require("./api/driver-registration");
const { registerDriverRoutes } = require("./api/driver");
const { registerBookingRoutes } = require("./api/booking");
const { registerOfferRoutes } = require("./api/offers");
const { registerTripRoutes } = require("./api/trips");
const { registerPaymentRoutes } = require("./api/payments");
const { registerDemoInboxRoutes } = require("./api/demo-inbox");
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function createApp(dependencies) {
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    const supplied = req.get("X-Correlation-Id");
    req.correlationId =
      supplied && uuidPattern.test(supplied) ? supplied : randomUUID();
    res.set("X-Correlation-Id", req.correlationId);
    next();
  });
  app.get("/health", (_req, res) => res.json({ status: "HEALTHY" }));
  const unavailable = async () => ({
    ready: false,
    dependencies: [
      ...targets.map((target) => ({
        name: target.name,
        status: "UNAVAILABLE",
        ready: false,
      })),
      { name: "redis", status: "UNAVAILABLE", ready: false },
    ],
  });
  const runtime = dependencies || {
    snapshot: unavailable,
    serviceHealth: async () => ({ ready: false }),
  };
  app.get("/ready", async (req, res) => {
    const snapshot = await runtime.snapshot(req.correlationId);
    if (snapshot.ready)
      return res.json({ status: "READY", dependencies: snapshot.dependencies });
    return sendError(
      res,
      req.correlationId,
      503,
      "SERVICE_UNAVAILABLE",
      "Required dependencies are not ready",
      { dependencies: snapshot.dependencies },
    );
  });
  app.get("/health/services", async (req, res) => {
    const snapshot = await runtime.snapshot(req.correlationId);
    res.json({
      services: [
        { name: "api-gateway", status: "HEALTHY", ready: snapshot.ready },
        ...snapshot.dependencies.filter((item) =>
          targets.some((target) => target.name === item.name),
        ),
      ],
    });
  });
  app.use(express.json({ limit: "1mb" }));
  registerAuthRoutes(app, runtime);
  registerDriverRegistration(app, runtime);
  registerDriverRoutes(app, runtime);
  registerBookingRoutes(app, runtime);
  registerOfferRoutes(app, runtime);
  registerTripRoutes(app, runtime);
  registerPaymentRoutes(app, runtime);
  registerDemoInboxRoutes(app, runtime);
  registerRoutes(app, runtime);
  registerLookupRoutes(app, runtime);
  app.use((_req, res) =>
    res.status(404).json({
      code: "NOT_FOUND",
      message: "Route not found",
      correlationId: _req.correlationId,
    }),
  );
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === "entity.parse.failed")
      return sendError(
        res,
        req.correlationId,
        400,
        "INVALID_ARGUMENT",
        "Invalid JSON request",
      );
    if (error.type === "entity.too.large")
      return sendError(
        res,
        req.correlationId,
        413,
        "PAYLOAD_TOO_LARGE",
        "Request payload is too large",
      );
    res
      .status(500)
      .json({
        code: "INTERNAL_ERROR",
        message: "Internal server error",
        correlationId: req.correlationId,
      });
  });
  return app;
}
module.exports = { createApp };
