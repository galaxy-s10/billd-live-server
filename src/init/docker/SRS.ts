import { execSync } from 'child_process';

import { DOCKER_SRS_CONFIG } from '@/config/secret';
import { PROJECT_ENV } from '@/constant';
import { dockerIsInstalled } from '@/utils';
import { chalkERROR, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';

export const dockerRunSRS = (init = true) => {
  if (!init) return;
  const flag = dockerIsInstalled();
  if (flag) {
    console.log(chalkWARN('docker已安装，开始启动SRS'));
  } else {
    console.log(chalkERROR('未安装docker！'));
    return;
  }
  let isRunning = false;
  if (PROJECT_ENV === 'development') {
    try {
      execSync(`docker ps -a | grep ${DOCKER_SRS_CONFIG.container}`);
      isRunning = true;
    } catch (error) {
      console.log(error);
    }
  }
  // if (isRunning) {
  //   console.log(chalkSUCCESS(`SRS正在运行！`));
  //   return;
  // }
  try {
    // 停掉旧的容器
    execSync(`docker stop ${DOCKER_SRS_CONFIG.container}`);
  } catch (error) {
    console.log(error);
  }
  try {
    // 启动新的容器
    // https://ossrs.net/lts/zh-cn/docs/v5/doc/webrtc#rtc-to-rtmp
    const srsCmd = `docker run -d --rm \
    --name ${DOCKER_SRS_CONFIG.container} \
    --env CANDIDATE=${DOCKER_SRS_CONFIG.CANDIDATE} \
    -p 1935:1935 \
    -p 5001:8080 \
    -p 1985:1985 \
    -p 8000:8000/udp \
    -v ${DOCKER_SRS_CONFIG.objsVolumePath}:/usr/local/srs/objs/ \
    -v ${DOCKER_SRS_CONFIG.confVolumePath}:/usr/local/srs/conf/ \
    ${DOCKER_SRS_CONFIG.image} objs/srs \
    -c conf/rtc2rtmp.conf`;

    execSync(srsCmd);
    console.log(chalkSUCCESS(`docker启动SRS成功！`));
    // const child = exec(srsSh, {}, (error, stdout, stderr) => {
    //   console.log(
    //     chalkSUCCESS(`${new Date().toLocaleString()},初始化SRS成功！`)
    //   );
    //   console.log('error', error);
    //   console.log('stdout', stdout);
    //   console.log('stderr', stderr);
    // });
    // child.on('exit', () => {
    //   console.log(
    //     chalkINFO(`${new Date().toLocaleString()},dockerStartSRS子进程退出了,${srsSh}`)
    //   );
    // });
    // child.on('error', () => {
    //   console.log(
    //     chalkERROR(`${new Date().toLocaleString()},dockerStartSRS子进程错误,${srsSh}`)
    //   );
    // });
  } catch (error) {
    console.log(error);
    console.log(chalkERROR(`docker启动SRS失败！`));
  }
};
