import amqp from 'amqplib';

import { LOCALHOST_URL } from '@/constant';
import { chalkSUCCESS } from '@/utils/chalkTip';

// @ts-ignore
const channel: { val: amqp.Channel } = { val: null };

export const orderQueue = 'order-channel';
export const orderMQChannel = { channel };

class RabbitMQClass {
  connection?: amqp.Connection;

  channel?: amqp.Channel;

  constructor() {
    this.connect();
  }

  connect = async () => {
    this.connection = await amqp.connect(`amqp://${LOCALHOST_URL}`);
    console.log(chalkSUCCESS('连接RabbitMQ成功！'));
    this.channel = await this.connection.createChannel();
    console.log(chalkSUCCESS('RabbitMQ创建channel成功！'));
  };
}

export const RabbitMQUtil = new RabbitMQClass();

export const connectRabbitMQ = (init = true) => {
  // durable持久化
  channel.val.assertQueue(orderQueue, { durable: false });
  channel.val.sendToQueue(
    orderQueue,
    Buffer.from(`${new Date().toLocaleString()}`)
  );
};
