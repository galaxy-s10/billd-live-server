import { execSync } from 'child_process';

import { chalkERROR, chalkSUCCESS } from '@/utils/chalkTip';

const localFile = '/Users/huangshuisheng/Desktop/fddm_1.mp4';
const remoteFlv = 'rtmp://localhost/live/livestream';

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
