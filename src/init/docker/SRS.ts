import { execSync } from 'child_process';

import { SRS_CONFIG } from '@/config/secret';
import { dockerIsInstalled } from '@/utils';
import { chalkERROR, chalkSUCCESS } from '@/utils/chalkTip';

export const dockerRunSRS = (init = true) => {
  if (!init) return;
  const flag = dockerIsInstalled();
  if (flag) {
    console.log(chalkSUCCESS('docker已安装，开始运行SRS'));
  } else {
    console.log(chalkERROR('未安装docker！'));
    return;
  }
  try {
    try {
      // 停掉旧的容器
      execSync(`docker stop ${SRS_CONFIG.dockerContainerName}`);
    } catch (error) {
      console.log(error);
    }
    try {
      // 停掉旧的容器
      execSync(`docker rm ${SRS_CONFIG.dockerContainerName}`);
    } catch (error) {
      console.log(error);
    }
    // 启动新的容器
    execSync(`docker run -d --rm --name ${SRS_CONFIG.dockerContainerName} --env CANDIDATE=${SRS_CONFIG.CANDIDATE} \
    -p 1935:1935 -p 5001:8080 -p 1985:1985 -p 8000:8000/udp \
    registry.cn-hangzhou.aliyuncs.com/ossrs/srs:4 \
    objs/srs -c conf/rtc2rtmp.conf`);
    console.log(chalkSUCCESS(`${new Date().toLocaleString()},初始化SRS成功！`));
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
    console.log(chalkERROR(`${new Date().toLocaleString()},初始化SRS失败！`));
  }
};
