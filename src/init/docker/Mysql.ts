import { execSync } from 'child_process';

import { MYSQL_CONFIG } from '@/secret/secret';
import { chalkERROR, chalkSUCCESS, chalkWARN, emoji } from '@/utils/chalkTip';

export const dockerRunMysql = (init = true) => {
  if (!init) return;
  console.log(chalkWARN('开始启动Mysql'));

  // let isRunning = false;
  // if (PROJECT_ENV === PROJECT_ENV_ENUM.dev) {
  //   try {
  //     execSync(`docker ps -a | grep ${MYSQL_CONFIG.docker.container}`);
  //     isRunning = true;
  //   } catch (error) {
  //     // console.log(error);
  //   }
  // }

  // if (isRunning) {
  //   console.log(chalkWARN(`Mysql正在运行！`));
  //   return;
  // }

  try {
    // 停掉旧的容器
    execSync(`docker stop ${MYSQL_CONFIG.docker.container}`);
  } catch (error) {
    console.log('停掉旧的mysql容器出错');
    // console.log(error);
  }

  try {
    // 删掉旧的容器
    execSync(`docker rm ${MYSQL_CONFIG.docker.container}`);
  } catch (error) {
    console.log('删掉旧的mysql容器出错');
    // console.log(error);
  }

  // 启动新的容器
  try {
    // -d即后台运行，https://docs.docker.com/engine/reference/run/#detached--d
    execSync(
      `docker run -d \
      -p ${MYSQL_CONFIG.docker.port[3306]}:3306 \
      --name ${MYSQL_CONFIG.docker.container} \
      -e MYSQL_ROOT_PASSWORD=${MYSQL_CONFIG.docker.MYSQL_ROOT_PASSWORD}  \
      -v ${MYSQL_CONFIG.docker.volume}/conf/my.cnf:/etc/my.cnf \
      -v ${MYSQL_CONFIG.docker.volume}/data:/var/lib/mysql/ \
      ${MYSQL_CONFIG.docker.image}`
    );
    console.log(chalkSUCCESS(`启动Mysql成功！`), emoji.get('✅'));
  } catch (error) {
    console.error(chalkERROR(`启动Mysql错误！`));
    console.log(error);
  }
};
