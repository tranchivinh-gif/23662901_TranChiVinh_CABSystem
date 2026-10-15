'use strict';
function eventMetrics(getRuntime){return async(_call,callback)=>{try{const runtime=getRuntime();callback(null,{json:JSON.stringify(runtime?await runtime.metrics():{enabled:false})});}catch{callback({code:14,details:'Event metrics unavailable'});}};}
module.exports={eventMetrics};
