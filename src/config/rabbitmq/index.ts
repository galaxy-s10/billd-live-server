import amqp from 'amqplib';

import { chalkSUCCESS } from '@/utils/chalkTip';

// @ts-ignore
const channel: { val: amqp.Channel } = { val: null };

export const orderQueue = 'order-channel';
export const orderMQChannel = { channel };

export const connectRabbitMQ = async () => {
  console.log('connectRabbitMQ');
  const connection = await amqp.connect('amqp://localhost');
  console.log(chalkSUCCESS('连接RabbitMQ成功！'));
  channel.val = await connection.createChannel();
  console.log(chalkSUCCESS('RabbitMQ创建channel成功！'));
  channel.val.assertQueue(orderQueue, { durable: false });
  channel.val.sendToQueue(
    orderQueue,
    Buffer.from(`${new Date().toLocaleString()}`)
  );
  setInterval(() => {
    channel.val.sendToQueue(
      orderQueue,
      Buffer.from(`${new Date().toLocaleString()}`)
    );
  }, 1000);
  // setTimeout(() => {
  //   console.log(chalkWARN('RabbitMQ关闭'));
  //   connection.close();
  // }, 4000);
};
