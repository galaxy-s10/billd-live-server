import { execSync, spawnSync } from 'child_process';

import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import { initUser } from '@/init/initData';
import liveService from '@/service/live.service';
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
  live_room_id;
  user_id;
  localFile: string;
  remoteFlv: string;
  flvurl: string;
  base64: string;
}) {
  const { res, err } = await tencentcloudUtils.queryLiveStream({
    roomId: live_room_id,
  });
  if (err) {
    return;
  }
  if (res) {
    const remoteFlv = tencentcloudUtils.getPushUrl({
      roomId: live_room_id,
    });
    // ffmpeg后台运行
    // https://www.jianshu.com/p/6ea70e6d8547
    // 1 代表标准输出
    // 2 代表标准错误
    // 1>/dev/null 把标准输出导入到null设备,也就是消失不见，如果要重定向到某个文件，可以1>1.txt
    // 2>&1 把标准错误也导入到标准输出同样的地方
    // -loglevel quiet不输出log
    const ffmpeg = `ffmpeg -loglevel quiet -stream_loop -1 -re -i ${localFile} -c copy -f flv '${remoteFlv}' 1>/dev/null 2>&1 &`;
    // const ffmpeg = `echo test initFFmpeg`;
    console.log('ffmpeg命令', ffmpeg);
    execSync(ffmpeg);
    const flvurl = tencentcloudUtils.getPullUrl({ roomId: live_room_id }).flv;
    const socketId = live_room_id;
    await liveService.deleteBySocketId(socketId);
    await liveService.create({
      live_room_id,
      user_id,
      socketId,
      system: 1,
      track_audio: true,
      track_video: true,
      coverImg: base64,
      streamurl: '',
      flvurl,
    });
  }
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
    if (PROJECT_ENV === PROJECT_ENV_ENUM.development) {
      await Promise.all([
        addLive({
          live_room_id: initUser.admin.live_room.id,
          user_id: initUser.admin.id,
          localFile: initUser.admin.live_room.localFile,
          remoteFlv: initUser.admin.live_room.remoteFlv,
          flvurl: initUser.admin.live_room.flvurl,
          base64: initUser.admin.live_room.base64,
        }),
        addLive({
          live_room_id: initUser.systemUser1.live_room.id,
          user_id: initUser.systemUser1.id,
          localFile: initUser.systemUser1.live_room.localFile,
          remoteFlv: initUser.systemUser1.live_room.remoteFlv,
          flvurl: initUser.systemUser1.live_room.flvurl,
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
            remoteFlv: initUser[item].live_room.remoteFlv,
            flvurl: initUser[item].live_room.flvurl,
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
