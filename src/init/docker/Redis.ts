import { execSync } from 'child_process';

import { REDIS_CONFIG } from '@/secret/secret';
import { chalkERROR, chalkSUCCESS, chalkWARN, emoji } from '@/utils/chalkTip';

export const dockerRunRedis = (init = true) => {
  if (!init) return;
  console.log(chalkWARN('开始启动Redis'));

  // let isRunning = false;

  // if (PROJECT_ENV === PROJECT_ENV_ENUM.dev) {
  //   try {
  //     execSync(`docker ps -a | grep ${REDIS_CONFIG.docker.container}`);
  //     isRunning = true;
  //   } catch (error) {
  //     // console.log(error);
  //   }
  // }

  // if (isRunning) {
  //   console.log(chalkWARN(`Redis正在运行！`));
  //   return;
  // }

  try {
    // 停掉旧的容器
    execSync(`docker stop ${REDIS_CONFIG.docker.container}`);
  } catch (error) {
    console.log('停掉旧的redis容器出错');
    // console.log(error);
  }

  try {
    // 删掉旧的容器
    execSync(`docker rm ${REDIS_CONFIG.docker.container}`);
  } catch (error) {
    console.log('删掉旧的redis容器出错');
    // console.log(error);
  }

  // 启动新的容器
  try {
    execSync(
      `docker run -d \
      -p ${REDIS_CONFIG.docker.port[6379]}:6379 \
      --name ${REDIS_CONFIG.docker.container} \
      -v ${REDIS_CONFIG.docker.volume}/data:/data \
      -v ${REDIS_CONFIG.docker.volume}/conf/redis.conf:/etc/redis/redis.conf \
      -v ${REDIS_CONFIG.docker.volume}/conf/users.acl:/etc/redis/users.acl \
      ${REDIS_CONFIG.docker.image} redis-server /etc/redis/redis.conf`
    );
    console.log(chalkSUCCESS(`启动Redis成功！`), emoji.get('✅'));
  } catch (error) {
    console.error(chalkERROR(`启动Redis错误！`));
    console.log(error);
  }
};
