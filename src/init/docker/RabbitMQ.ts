import { execSync } from 'child_process';

import { DOCKER_RABBITMQ_CONFIG } from '@/config/secret';
import { dockerIsInstalled } from '@/utils';
import { chalkERROR, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';

export const dockerRunRabbitMQ = (init = true) => {
  if (!init) return;
  const flag = dockerIsInstalled();
  if (flag) {
    console.log(chalkWARN('docker已安装，开始启动RabbitMQ'));
  } else {
    console.log(chalkERROR('未安装docker！'));
    return;
  }
  try {
    // 停掉旧的容器
    execSync(`docker stop ${DOCKER_RABBITMQ_CONFIG.container}`);
  } catch (error) {
    console.log(error);
  }
  // 启动新的容器
  try {
    // 1 代表标准输出
    // 2 代表标准错误
    // 1>/dev/null 把标准输出导入到null设备,也就是消失不见，如果要重定向到某个文件，可以1>1.txt
    // 2>&1 把标准错误也导入到标准输出同样的地方
    // -d即后台运行，https://docs.docker.com/engine/reference/run/#detached--d
    execSync(
      // https://www.rabbitmq.com/download.html
      // 官网命令是带-it参数的，但是使用execSync执行docker的话，不能带-it，否则报错：the input device is not a TTY
      // `docker run -it -d --rm --name ${DOCKER_RABBITMQ_CONFIG.container} -p 5672:5672 -p 15672:15672 ${DOCKER_RABBITMQ_CONFIG.dockerImage}`
      `docker run -d --rm --name ${DOCKER_RABBITMQ_CONFIG.container} -p 5672:5672 -p 15672:15672 ${DOCKER_RABBITMQ_CONFIG.image}`
    );
    console.log(chalkSUCCESS(`docker启动RabbitMQ成功！`));
  } catch (error) {
    console.log(chalkERROR(`docker启动RabbitMQ错误！`));
    console.log(error);
  }
};
