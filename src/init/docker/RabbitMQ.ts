import { execSync } from 'child_process';

import { RABBITMQ_CONFIG } from '@/secret/secret';
import { chalkERROR, chalkSUCCESS, chalkWARN, emoji } from '@/utils/chalkTip';

export const dockerRunRabbitMQ = (init = true) => {
  if (!init) return;
  console.log(chalkWARN('开始启动RabbitMQ'));

  // let isRunning = false;

  // if (PROJECT_ENV === PROJECT_ENV_ENUM.dev) {
  //   try {
  //     execSync(`docker ps -a | grep ${RABBITMQ_CONFIG.docker.container}`);
  //     isRunning = true;
  //   } catch (error) {
  //     // console.log(error);
  //   }
  // }

  // if (isRunning) {
  //   console.log(chalkWARN(`RabbitMQ正在运行！`));
  //   return;
  // }

  try {
    // 停掉旧的容器
    execSync(`docker stop ${RABBITMQ_CONFIG.docker.container}`);
  } catch (error) {
    console.log('停掉旧的rabbitmq容器出错');
    // console.log(error);
  }

  try {
    // 删掉旧的容器
    execSync(`docker rm ${RABBITMQ_CONFIG.docker.container}`);
  } catch (error) {
    console.log('删掉旧的rabbitmq容器出错');
    // console.log(error);
  }

  // 启动新的容器
  try {
    execSync(
      // https://www.rabbitmq.com/download.html
      `docker run -d \
       --name ${RABBITMQ_CONFIG.docker.container} \
       -p ${RABBITMQ_CONFIG.docker.port[5672]}:5672 \
       -p ${RABBITMQ_CONFIG.docker.port[15672]}:15672 \
       ${RABBITMQ_CONFIG.docker.image}`
    );
    console.log(chalkSUCCESS(`启动RabbitMQ成功！`), emoji.get('✅'));
  } catch (error) {
    console.error(chalkERROR(`启动RabbitMQ错误！`));
    console.log(error);
  }
};
