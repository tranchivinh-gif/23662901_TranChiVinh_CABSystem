'use strict';
const {Kafka,logLevel}=require('kafkajs'),config=require('./config');
function createKafka(service,env=process.env){return new Kafka({clientId:'cab.'+service,brokers:(env.KAFKA_BROKERS || 'kafka:9092').split(','),logLevel:logLevel.NOTHING,connectionTimeout:1000,requestTimeout:3000,retry:{initialRetryTime:100,retries:1}});}
async function ensureTopics(kafka){const admin=kafka.admin();await admin.connect();try{
  await admin.createTopics({waitForLeaders:true,topics:config.topics.flatMap(topic=>[{topic,numPartitions:3,replicationFactor:1,configEntries:[{name:'retention.ms',value:String(config.retentionMs)}]},{topic:topic+'.dlq',numPartitions:3,replicationFactor:1,configEntries:[{name:'retention.ms',value:String(config.dlqRetentionMs)}]}])});
  const metadata=await admin.fetchTopicMetadata({topics:config.topics.flatMap(topic=>[topic,topic+'.dlq'])});
  if(metadata.topics.some(topic=>topic.partitions.length!==3))throw new Error('Kafka partition policy drift');
  await admin.alterConfigs({resources:metadata.topics.map(topic=>({type:2,name:topic.name,configEntries:[{name:'retention.ms',value:String(topic.name.endsWith('.dlq')?config.dlqRetentionMs:config.retentionMs)}]}))});
  return {topics:metadata.topics.map(topic=>({name:topic.name,partitions:topic.partitions.length,retentionMs:topic.name.endsWith('.dlq')?config.dlqRetentionMs:config.retentionMs})),replicationFactor:1};
}finally{await admin.disconnect();}}
module.exports={createKafka,ensureTopics};
