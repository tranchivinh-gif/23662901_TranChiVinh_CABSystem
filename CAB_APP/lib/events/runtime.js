'use strict';
const {createKafka}=require('./kafka'),{createOutbox}=require('./outbox'),{createInbox}=require('./consumer');
function createEventsRuntime({pool,service,env=process.env,topics=[],handle,afterPublish}){
  if(env.CAB_EVENTS_ENABLED!=='true')return null;
  const kafka=createKafka(service,env),producer=kafka.producer({idempotent:true,maxInFlightRequests:1,allowAutoTopicCreation:false}),group='cab.'+service+'.v1';
  const consumer=handle?kafka.consumer({groupId:group,allowAutoTopicCreation:false,maxWaitTimeInMs:250,sessionTimeout:10000,heartbeatInterval:1000,retry:{retries:1,restartOnFailure:async()=>false}}):null;
  const outbox=createOutbox({pool,producer,service,afterPublish}),inbox=handle?createInbox({pool,group,handle}):null;
  let producing=false,consuming=false,consumerStarted=false,stopping=false,timer,pending;
  consumer?.on(consumer.events.GROUP_JOIN,()=>{consuming=true;});
  for(const event of [consumer?.events.CRASH,consumer?.events.DISCONNECT,consumer?.events.STOP].filter(Boolean))consumer.on(event,()=>{consuming=false;consumerStarted=false;});
  async function tick(){if(pending)return pending;pending=(async()=>{
    if(stopping)return;
    if(!producing){await producer.connect();producing=true;}
    if(consumer && !consumerStarted){consumerStarted=true;try{await consumer.connect();await consumer.subscribe({topics,fromBeginning:true});await consumer.run({autoCommit:false,eachMessage:async({topic,partition,message})=>{await inbox.receive({topic,partition,message});await consumer.commitOffsets([{topic,partition,offset:(BigInt(message.offset)+1n).toString()}]);}});}catch(error){consumerStarted=false;throw error;}}
    for(let i=0;i<20 && !stopping;i++){let work=false;work=await outbox.publish() || work;work=await outbox.publishDeadLetter() || work;if(inbox)work=await inbox.process() || work;if(!work)break;}
  })().catch(()=>{producing=false;}).finally(()=>{pending=undefined;});return pending;}
  async function metrics(){const result={enabled:true,service,group:handle?group:null,producerConnected:producing,consumerConnected:consuming,brokerAvailable:false};
    result.outbox=(await pool.query("SELECT status,count(*)::integer AS count FROM outbox_events GROUP BY status")).rows;
    result.inbox=(await pool.query("SELECT status,count(*)::integer AS count,COALESCE(max(attempt_count),0) AS max_attempts FROM kafka_inbox GROUP BY status")).rows;
    result.deadLetters=(await pool.query('SELECT count(*)::integer AS count,count(published_at)::integer AS published FROM kafka_dead_letters')).rows[0];
    const admin=kafka.admin();try{await admin.connect();if(handle){const committed=await admin.fetchOffsets({groupId:group,topics}),lag=[];for(const topic of topics){const latest=await admin.fetchTopicOffsets(topic);for(const partition of latest){const value=committed.find(value=>value.topic===topic)?.partitions.find(value=>value.partition===partition.partition)?.offset || '-1',offset=BigInt(value)<0n?0n:BigInt(value);lag.push({topic,partition:partition.partition,committedOffset:offset.toString(),endOffset:partition.offset,lag:(BigInt(partition.offset)>offset?BigInt(partition.offset)-offset:0n).toString()});}}result.lag=lag;}else await admin.listTopics();result.brokerAvailable=true;}catch{result.safeErrorCode='KAFKA_UNAVAILABLE';}finally{await admin.disconnect().catch(()=>{});}return result;
  }
  return {tick,inbox,outbox,metrics,start(){timer=setInterval(()=>tick(),250);timer.unref();tick();},async stop(){stopping=true;clearInterval(timer);await pending;await consumer?.stop().catch(()=>{});await consumer?.disconnect().catch(()=>{});await producer.disconnect().catch(()=>{});}};
}
module.exports={createEventsRuntime};
