import { execSync } from 'child_process';

import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import liveService from '@/service/live.service';
import { chalkERROR, chalkSUCCESS } from '@/utils/chalkTip';

let localFile = '/Users/huangshuisheng/Desktop/fddm_2.mp4';
let streamurl = 'webrtc://localhost.cn:5001/live/livestream/fddm_2';
let flvurl = 'http://localhost:5001/live/livestream/fddm_2.flv';

const remoteFlv = 'rtmp://localhost/live/livestream/fddm_2';

if (PROJECT_ENV === PROJECT_ENV_ENUM.prod) {
  localFile = '/node/fddm_2.mp4';
  streamurl = 'webrtc://hsslive.cn:5001/live/livestream/fddm_2';
  flvurl = 'https://www.hsslive.cn/srsflv/live/livestream/fddm_2.flv';
}

async function addLive() {
  const socketId = 'socketId_fddm_2';
  await liveService.deleteBySocketId(socketId);
  liveService.create({
    roomId: 'roomId_fddm_2',
    socketId,
    roomName: '房东的猫',
    system: 1,
    track_audio: true,
    track_video: true,
    coverImg: '',
    streamurl,
    flvurl,
  });
}

export const initFFmpeg = () => {
  try {
    // ffmpeg后台运行
    // https://www.jianshu.com/p/6ea70e6d8547
    // 1 代表标准输出
    // 2 代表标准错误
    // 1>/dev/null 把标准输出导入到null设备,也就是消失不见，如果要重定向到某个文件，可以1>1.txt
    // 2>&1 把标准错误也导入到标准输出同样的地方
    // -loglevel quiet不输出log
    const ffmpeg = `ffmpeg -loglevel quiet -stream_loop -1 -re -i ${localFile} -c copy -f flv ${remoteFlv} 1>/dev/null 2>&1 &`;
    // const ffmpeg = `echo test initFFmpeg`;
    execSync(ffmpeg);
    console.log(
      chalkSUCCESS(`${new Date().toLocaleString()},初始化FFmpeg成功！`)
    );
    addLive();
    // const child = exec(ffmpeg, (error, stdout, stderr) => {
    //   console.log(
    //     chalkSUCCESS(`${new Date().toLocaleString()}初始化FFmpeg成功！`)
    //   );
    //   console.log('error', error);
    //   console.log('stdout', stdout);
    //   console.log('stderr', stderr);
    // });
    // child.on('exit', () => {
    //   console.log(
    //     chalkINFO(`${new Date().toLocaleString()},initFFmpeg子进程退出了`)
    //   );
    // });
    // child.on('error', () => {
    //   console.log(
    //     chalkINFO(`${new Date().toLocaleString()},initFFmpeg子进程错误`)
    //   );
    // });
  } catch (error) {
    console.log(
      chalkERROR(`${new Date().toLocaleString()},初始化FFmpeg错误！`)
    );
    console.log(error);
  }
};
