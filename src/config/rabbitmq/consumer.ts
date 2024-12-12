import { mq } from '@/config/rabbitmq';
import { RABBITMQ_CHANNEL } from '@/constant';
import { chalkWARN } from '@/utils/chalkTip';

// consumer 消费者
export const connectRabbitMQConsumer = () => {
  console.log(chalkWARN('连接RabbitMQ Consumer'));

  setInterval(() => {
    mq.channel?.consume(
      RABBITMQ_CHANNEL.order,
      (msg) => {
        console.log(msg?.content.toString(), 'consume');
      },
      { noAck: true }
    );
  }, 2000);
};
