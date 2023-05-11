import { execSync, spawnSync } from 'child_process';

import { SRS_CONFIG } from '@/config/secret';
import { chalkERROR, chalkSUCCESS } from '@/utils/chalkTip';

function dockerIsInstalled() {
  const res = spawnSync('docker', ['-v']);
  if (res.status !== 0) {
    return false;
  }
  return true;
}

const srsCmd = `


echo 停掉旧的容器$JOBNAME:
docker stop $JOBNAME

echo 删掉旧的容器$JOBNAME:
docker rm $JOBNAME

echo 启动新的容器$JOBNAME:

# -d, 后台运行
# -p :80:8080, 将容器的8080端口映射到主机的80端口

# RTC to RTMP
docker run -d --name $JOBNAME --rm --env CANDIDATE=$CANDIDATE \
  -p 1935:1935 -p 5001:8080 -p 1985:1985 -p 8000:8000/udp \
  registry.cn-hangzhou.aliyuncs.com/ossrs/srs:4 \
  objs/srs -c conf/rtc2rtmp.conf

`;

export const initSRS = () => {
  const flag = dockerIsInstalled();
  if (flag) {
    console.log(chalkSUCCESS('docker已安装，开始运行docker-srs'));
  } else {
    console.log(chalkERROR('未安装docker！'));
    return;
  }
  try {
    // const srsSh = `sh ${path.resolve(process.cwd(), 'srs.sh')}`;
    // 停掉旧的容器
    execSync(`docker stop ${SRS_CONFIG.dockerContainerName}`);
    // 删掉旧的容器
    execSync(`docker rm ${SRS_CONFIG.dockerContainerName}`);
    // 启动新的容器
    execSync(`docker run -d --name $JOBNAME --rm --env CANDIDATE=$CANDIDATE \
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
    //     chalkINFO(`${new Date().toLocaleString()},initSRS子进程退出了,${srsSh}`)
    //   );
    // });
    // child.on('error', () => {
    //   console.log(
    //     chalkERROR(`${new Date().toLocaleString()},initSRS子进程错误,${srsSh}`)
    //   );
    // });
  } catch (error) {
    console.log(error);
  }
};
