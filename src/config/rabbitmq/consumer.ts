import { orderMQChannel, orderQueue } from './index';

export const initRabbitMQConsumer = () => {
  console.log('initRabbitMQConsumer', orderMQChannel);
  setTimeout(() => {
    if (orderMQChannel.channel.val) {
      orderMQChannel.channel.val.consume(
        orderQueue,
        (msg) => {
          console.log(msg?.content.toString(), 666);
        },
        { noAck: true }
      );
    }
  }, 1000);
};
