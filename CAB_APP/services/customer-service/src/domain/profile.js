'use strict';
function profile(request) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(request.accountId || '') || !request.fullName?.trim() ||
    (request.phone && !/^\+[1-9]\d{5,14}$/.test(request.phone)) || typeof request.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) throw new Error('Invalid profile');
  return { fullName:request.fullName.trim(),email:request.email.trim().toLowerCase(),...(request.phone?{phone:request.phone}:{}) };
}
module.exports={profile};
