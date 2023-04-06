import { BILIBILI_LIVE_KEY, BILIBILI_LIVE_URL } from '@/config/secret';

import { PROJECT_ENV, PROJECT_ENV_ENUM } from './constant';

let localFile = 'https://resource.hsslive.cn/media/fddm_2.mp4';
let remoteFlv = 'rtmp://localhost/live/fddm_2';

if (PROJECT_ENV !== PROJECT_ENV_ENUM.development) {
  localFile = '/node/fddm_2.mp4';
  remoteFlv = `${BILIBILI_LIVE_URL}${BILIBILI_LIVE_KEY}`;
}

// ffmpeg后台运行
// https://www.jianshu.com/p/6ea70e6d8547
// 1 代表标准输出
// 2 代表标准错误
// 1>/dev/null 把标准输出导入到null设备,也就是消失不见，如果要重定向到某个文件，可以1>1.txt
// 2>&1 把标准错误也导入到标准输出同样的地方
export const ffmpegSh = `ffmpeg -stream_loop -1 -re -i ${localFile} -c copy -f flv "${remoteFlv}" 1>/dev/null 2>&1 &`;
