import { orderMQChannel, orderQueue } from './index';

export const initRabbitMQConsumer = () => {
  console.log('initRabbitMQConsumer', orderMQChannel);
  if (orderMQChannel.channel.val) {
    orderMQChannel.channel.val.consume(
      orderQueue,
      (msg) => {
        console.log(msg, '----');
      },
      { noAck: true }
    );
  }
};
