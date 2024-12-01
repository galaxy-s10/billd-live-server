import { execSync } from 'child_process';

import { SRS_CONFIG } from '@/secret/secret';
import { chalkERROR, chalkSUCCESS, chalkWARN, emoji } from '@/utils/chalkTip';

export const dockerRunSRS = (init = true) => {
  if (!init) return;
  console.log(chalkWARN('开始启动SRS'));

  // let isRunning = false;

  // if (PROJECT_ENV === PROJECT_ENV_ENUM.development) {
  //   try {
  //     execSync(`docker ps -a | grep ${SRS_CONFIG.docker.container}`);
  //     isRunning = true;
  //   } catch (error) {
  //     // console.log(error);
  //   }
  // }

  // if (isRunning) {
  //   console.log(chalkWARN(`SRS正在运行！`));
  //   return;
  // }

  try {
    // 停掉旧的容器
    execSync(`docker stop ${SRS_CONFIG.docker.container}`);
  } catch {
    console.log('停掉旧的srs容器出错');
  }

  try {
    // 启动新的容器
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/webrtc#rtc-to-rtmp
    const srsCmd = `docker run -d --rm \
    --name ${SRS_CONFIG.docker.container} \
    --env CANDIDATE=${SRS_CONFIG.CANDIDATE} \
    -p ${SRS_CONFIG.docker.port[1935]}:1935 \
    -p ${SRS_CONFIG.docker.port[8080]}:8080 \
    -p ${SRS_CONFIG.docker.port[1985]}:1985 \
    -p ${SRS_CONFIG.docker.port[8000]}:8000/udp \
    -v ${SRS_CONFIG.docker.volume}/conf:/usr/local/srs/conf/ \
    -v ${SRS_CONFIG.docker.volume}/objs:/usr/local/srs/objs/ \
    ${SRS_CONFIG.docker.image} objs/srs \
    -c conf/rtc2rtmp.conf`;

    execSync(srsCmd);
    console.log(chalkSUCCESS(`启动SRS成功！`), emoji.get('✅'));
    // const child = exec(srsSh, {}, (error, stdout, stderr) => {
    //   console.log(
    //     chalkSUCCESS(`初始化SRS成功！`)
    //   );
    //   console.log('error', error);
    //   console.log('stdout', stdout);
    //   console.log('stderr', stderr);
    // });
    // child.on('exit', () => {
    //   console.log(
    //     chalkINFO(`dockerStartSRS子进程退出了,${srsSh}`)
    //   );
    // });
    // child.on('error', () => {
    //   console.log(
    //     chalkERROR(`dockerStartSRS子进程错误,${srsSh}`)
    //   );
    // });
  } catch (error) {
    console.log(error);
    console.log(chalkERROR(`启动SRS失败！`));
  }
};
