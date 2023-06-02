import amqp from 'amqplib';

import { chalkSUCCESS } from '@/utils/chalkTip';

// @ts-ignore
const channel: { val: amqp.Channel } = { val: null };

export const orderQueue = 'order-channel';
export const orderMQChannel = { channel };

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect('amqp://localhost');
  channel.val = await connection.createChannel();
  console.log(chalkSUCCESS('RabbitMQ成功'), channel);
  channel.val.assertQueue(orderQueue, { durable: false });
  channel.val.sendToQueue(orderQueue, Buffer.from(`aaa${new Date()}`));
  // setTimeout(() => {
  //   console.log(chalkWARN('RabbitMQ关闭'));
  //   connection.close();
  // }, 4000);
};
