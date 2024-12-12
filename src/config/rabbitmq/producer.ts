import { mq } from '@/config/rabbitmq';
import { RABBITMQ_CHANNEL } from '@/constant';
import { chalkWARN } from '@/utils/chalkTip';

// producer 生产者
export const connectRabbitMQProducer = () => {
  console.log(chalkWARN('连接RabbitMQ Producer'));

  setInterval(() => {
    mq.channel?.sendToQueue(
      RABBITMQ_CHANNEL.order,
      Buffer.from(`${new Date().toLocaleString()}`)
    );
  }, 1000);
};
