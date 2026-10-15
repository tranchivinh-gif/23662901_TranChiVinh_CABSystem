'use strict';
const crypto = require('node:crypto');
const password = '123';
const center = { lat: 10.8231, lng: 106.6297 };
function id(label) {
  const chars = crypto.createHash('sha256').update('cab-standalone-demo-v1:' + label).digest('hex').slice(0, 32).split('');
  chars[12] = '4'; chars[16] = '8';
  const value = chars.join('');
  return [value.slice(0,8),value.slice(8,12),value.slice(12,16),value.slice(16,20),value.slice(20)].join('-');
}
function person(name, role, number) {
  const localPhone = '0900000' + String(number).padStart(3, '0');
  return { name, role, localPhone, phone: '+84' + localPhone.slice(1), email:(role==='CUSTOMER'?'khach'+number+'@gmail.com':name+'@example.test'),
    accountId: id(name + ':account'), profileId: id(name + ':profile'), fullName: 'CAB Demo ' + name };
}
const customers = [person('customer1','CUSTOMER',1)];
const operators = [person('admin','ADMIN',10),person('staff','STAFF',11)];
const drivers = Array.from({length:10},(_,index)=>person('driver'+(index+1),'DRIVER',101+index));
module.exports = { password, center, id, customers, operators, drivers };
