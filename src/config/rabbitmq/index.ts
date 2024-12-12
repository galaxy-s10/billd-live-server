import amqp from 'amqplib';

import { LOCALHOST_URL, RABBITMQ_CHANNEL } from '@/constant';
import { chalkSUCCESS } from '@/utils/chalkTip';

class RabbitMQClass {
  connection?: amqp.Connection;

  channel?: amqp.Channel;

  connect = async () => {
    const url = `amqp://${LOCALHOST_URL}`;
    this.connection = await amqp.connect(url);
    console.log(chalkSUCCESS(`连接${url}服务器的RabbitMQ成功！`));
    this.channel = await this.connection.createChannel();
    console.log(chalkSUCCESS('RabbitMQ创建channel成功！'));
  };
}

export const mq = new RabbitMQClass();

export const connectRabbitMQ = async () => {
  await mq.connect();
  // durable持久化
  mq.channel?.assertQueue(RABBITMQ_CHANNEL.order, { durable: false });
};
