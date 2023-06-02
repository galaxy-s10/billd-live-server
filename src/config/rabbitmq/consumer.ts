import { orderMQChannel, orderQueue } from './index';

export const initRabbitMQConsumer = () => {
  if (orderMQChannel.channel.val) {
    orderMQChannel.channel.val.consume(
      orderQueue,
      (msg) => {
        console.log(msg?.content.toString(), '----');
      },
      { noAck: true }
    );
  }
};
