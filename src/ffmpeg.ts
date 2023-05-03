// let localFile = 'https://project.hsslive.cn/fddm_2.mp4';
// let remoteFlv = 'rtmp://localhost/live/fddm_2';
const localFile = '/Users/huangshuisheng/Desktop/fddm_1.mp4';
const remoteFlv = 'rtmp://localhost/live/livestream';

// ffmpeg后台运行
// https://www.jianshu.com/p/6ea70e6d8547
// 1 代表标准输出
// 2 代表标准错误
// 1>/dev/null 把标准输出导入到null设备,也就是消失不见，如果要重定向到某个文件，可以1>1.txt
// 2>&1 把标准错误也导入到标准输出同样的地方
// -loglevel quiet不输出log
export const ffmpegSh = `ffmpeg -stream_loop -1 -re -i ${localFile} -c copy -f flv "${remoteFlv}"`;
// export const ffmpegSh =
//   'ffmpeg -stream_loop -1 -re -i /Users/huangshuisheng/Desktop/fddm_1.mp4 -c copy -f flv "rtmp://localhost/live/livestream" 1>/dev/null 2>&1 &';
