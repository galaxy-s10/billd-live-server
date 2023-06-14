import { execSync, spawnSync } from 'child_process';

import cryptojs from 'crypto-js';

import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import { initUser } from '@/init/initData';
import liveService from '@/service/live.service';
import userService from '@/service/user.service';
import { chalkERROR, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';
import { tencentcloudUtils } from '@/utils/tencentcloud';

function ffmpegIsInstalled() {
  const res = spawnSync('ffmpeg', ['-version']);
  if (res.status !== 0) {
    return false;
  }
  return true;
}

async function addLive({
  live_room_id,
  user_id,
  localFile,
  base64,
}: {
  live_room_id: number;
  user_id: number;
  localFile: string;
  base64: string;
}) {
  async function main({ remoteFlv }: { remoteFlv: string }) {
    try {
      const getOldProcess = `ps aux | grep ffmpeg | grep -v grep | grep '${remoteFlv}' | awk '{print $2}'`;
      const res = execSync(getOldProcess);
      const oldProcess = res.toString().trim();
      if (oldProcess) {
        const killOldFFmpeg = `kill -9 ${oldProcess}`;
        execSync(killOldFFmpeg);
      }
    } catch (error) {
      console.log(error);
    }

    // ffmpeg后台运行
    // https://www.jianshu.com/p/6ea70e6d8547
    // 1 代表标准输出
    // 2 代表标准错误
    // 1>/dev/null 把标准输出导入到null设备,也就是消失不见，如果要重定向到某个文件，可以1>1.txt
    // 2>&1 把标准错误也导入到标准输出同样的地方
    // -loglevel quiet不输出log
    const ffmpeg = `ffmpeg -loglevel quiet -stream_loop -1 -re -i ${localFile} -c copy -f flv '${remoteFlv}' 1>/dev/null 2>&1 &`;
    const test = `ffmpeg -stream_loop -1 -re -i /Users/huangshuisheng/Desktop/hss/galaxy-s10/billd-live-server/src/public/dev_fddm.mp4 -c copy -f flv 'rtmp://localhost/livestream/roomId___1'`;
    // const ffmpeg = `echo test initFFmpeg`;
    execSync(ffmpeg);
    const socketId = `${live_room_id}`;
    await liveService.deleteBySocketId(socketId);
  }
  const userInfo = await userService.findAndToken(user_id);
  let flvurl = '';
  if (PROJECT_ENV !== PROJECT_ENV_ENUM.prod) {
    const rtmptoken = cryptojs.MD5(userInfo?.token || '').toString();
    await main({
      remoteFlv: `rtmp://localhost/livestream/roomId___${live_room_id}?token=${rtmptoken}`,
    });
    flvurl = `http://localhost:5001/livestream/roomId___${live_room_id}.flv`;
  } else {
    await tencentcloudUtils.dropLiveStream({
      roomId: live_room_id,
    });
    const { res, err } = await tencentcloudUtils.queryLiveStream({
      roomId: live_room_id,
    });
    if (err) return;
    if (res) {
      const remoteFlv = tencentcloudUtils.getPushUrl({
        roomId: live_room_id,
      });
      flvurl = tencentcloudUtils.getPullUrl({ roomId: live_room_id }).flv;
      await main({ remoteFlv });
    }
  }
  await liveService.create({
    live_room_id,
    user_id,
    socketId: `${live_room_id}`,
    system: 1,
    track_audio: true,
    track_video: true,
    coverImg: base64,
    streamurl: '',
    flvurl,
  });
}

export const initFFmpeg = async (init = true) => {
  if (!init) return;
  const flag = ffmpegIsInstalled();
  if (flag) {
    console.log(chalkWARN('ffmpeg已安装，开始运行ffmpeg推流'));
  } else {
    console.log(chalkERROR('未安装ffmpeg！'));
    return;
  }
  try {
    try {
      // const fullCMD = `kill -9 $(ps aux | grep ffmpeg | grep -v grep | awk '{print $2}')`;
      const getOldProcess = `ps aux | grep ffmpeg | grep -v grep | awk '{print $2}'`;
      const res = execSync(getOldProcess);
      const oldProcess = res.toString().trim();
      if (oldProcess) {
        const killOldFFmpeg = `kill -9 $(${getOldProcess}')`;
        execSync(killOldFFmpeg);
      }
    } catch (error) {
      console.log(error);
    }
    if (PROJECT_ENV === PROJECT_ENV_ENUM.development) {
      await Promise.all([
        addLive({
          live_room_id: initUser.admin.live_room.id,
          user_id: initUser.admin.id,
          localFile: initUser.admin.live_room.localFile,
          base64: initUser.admin.live_room.base64,
        }),
        addLive({
          live_room_id: initUser.systemUser1.live_room.id,
          user_id: initUser.systemUser1.id,
          localFile: initUser.systemUser1.live_room.localFile,
          base64: initUser.systemUser1.live_room.base64,
        }),
      ]);
    } else {
      const queue: any[] = [];
      Object.keys(initUser).forEach((item) => {
        queue.push(
          addLive({
            live_room_id: initUser[item].live_room.id,
            user_id: initUser[item].id,
            localFile: initUser[item].live_room.localFile,
            base64: initUser[item].live_room.base64,
          })
        );
      });
      await Promise.all(queue);
    }
    console.log(chalkSUCCESS(`FFmpeg推流成功！`));

    // const child = exec(ffmpeg, (error, stdout, stderr) => {
    //   console.log(
    //     chalkSUCCESS(`初始化FFmpeg成功！`)
    //   );
    //   console.log('error', error);
    //   console.log('stdout', stdout);
    //   console.log('stderr', stderr);
    // });
    // child.on('exit', () => {
    //   console.log(
    //     chalkINFO(`initFFmpeg子进程退出了`)
    //   );
    // });
    // child.on('error', () => {
    //   console.log(
    //     chalkINFO(`initFFmpeg子进程错误`)
    //   );
    // });
  } catch (error) {
    console.log(chalkERROR(`FFmpeg推流错误！`));
    console.log(error);
  }
};
