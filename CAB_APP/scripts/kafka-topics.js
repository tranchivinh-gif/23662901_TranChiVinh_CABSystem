'use strict';
const {createKafka,ensureTopics}=require('../lib/events/kafka');
async function main(){const kafka=createKafka('topic-bootstrap');await ensureTopics(kafka);console.log('Kafka: six versioned topics and six DLQs verified (3 partitions; retention 7/14 days).');}
if(require.main===module)main().catch(()=>{console.error('Kafka topic bootstrap failed');process.exitCode=1;});
module.exports={main};
