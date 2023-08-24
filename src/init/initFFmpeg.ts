import { exec, spawnSync } from 'child_process';

import { getRandomString } from 'billd-utils';

import { SERVER_LIVE } from '@/config/secret';
import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import srsController from '@/controller/srs.controller';
import { initUser } from '@/init/initUser';
import { LiveRoomTypeEnum } from '@/interface';
import liveService from '@/service/live.service';
import liveRoomService from '@/service/liveRoom.service';
import { chalkERROR, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';
import { tencentcloudUtils } from '@/utils/tencentcloud';

function ffmpegIsInstalled() {
  const res = spawnSync('ffmpeg', ['-version']);
  if (res.status !== 0) {
    return false;
  }
  return true;
}
const randomId = getRandomString(10);
async function addLive({
  live_room_id,
  user_id,
  localFile,
  cover_img,
  cdn,
  initFFmpeg,
  weight,
}: {
  live_room_id: number;
  user_id: number;
  localFile: string;
  cover_img: string;
  cdn: number; // 1:使用cdn;2:不使用cdn
  initFFmpeg: boolean;
  weight: number;
}) {
  let flv_url = '';
  let hls_url = '';
  let rtmp_url = '';
  async function main() {
    const res = await liveService.findAllLiveByRoomId(live_room_id);
    const queue: any[] = [];
    res.forEach((item) => {
      console.log('踢掉它', item.srs_client_id);
      queue.push(srsController.common.deleteApiV1Clients(item.srs_client_id!));
    });
    await Promise.all(queue);
    await liveService.deleteByLiveRoomId(live_room_id);
    // 开发环境时判断initFFmpeg，是true的才初始化ffmpeg
    // 生产环境时不判断initFFmpeg，都初始化
    if (
      (PROJECT_ENV === PROJECT_ENV_ENUM.development && initFFmpeg) ||
      PROJECT_ENV === PROJECT_ENV_ENUM.prod
    ) {
      // const ffmpegCmd = spawn(`ffmpeg`, [
      //   '-loglevel', // -loglevel quiet不输出log
      //   'quiet',
      //   '-readrate', // 以本地帧频读数据，主要用于模拟捕获设备
      //   '1',
      //   '-stream_loop', // 设置输入流应循环的次数。Loop 0表示无循环，loop-1表示无限循环。
      //   '-1',
      //   '-i', // 输入
      //   localFile,
      //   '-vcodec', // 只拷贝视频部分，不做编解码。
      //   'copy',
      //   '-acodec', // / 只拷贝音频部分，不做编解码。
      //   'copy',
      //   '-f', // 强制输入或输出文件格式。通常会自动检测输入文件的格式，并根据输出文件的文件扩展名猜测格式，因此在大多数情况下不需要此选项。
      //   'flv',
      //   rtmp_url,
      // ]);
      // const { pid } = ffmpegCmd;
      // console.log(chalkWARN('ffmpeg进程pid'), pid);
      const ffmpegCmd = `ffmpeg -loglevel quiet -readrate 1 -stream_loop -1 -i ${localFile} -vcodec copy -acodec copy -f flv '${rtmp_url}'`;
      const ffmpegSyncCmd = `ffmpeg -loglevel quiet -readrate 1 -stream_loop -1 -i ${localFile} -vcodec copy -acodec copy -f flv '${rtmp_url}' 1>/dev/null 2>&1 &`;
      // const ffmpegCmd = `ffmpeg -loglevel quiet -readrate 1 -stream_loop -1 -i /Users/huangshuisheng/Desktop/hss/galaxy-s10/billd-live-server/src/video/fddm_mhsw.mp4 -vcodec copy -acodec copy -f flv 'rtmp://localhost/livestream/roomId___3?token=eff5e5d9116254a1aea19013f8bd3afe' 1>/dev/null 2>&1 &`;
      try {
        // WARN 使用execSync的话，命令最后需要添加：1>/dev/null 2>&1 &，否则会自动退出进程；
        // 但是本地开发环境的时候，因为nodemon的缘故，每次热更新后，在ffmpeg推完流后，触发on_unpublish钩子，删除了live表里的直播记录
        // 实际上本地还在推流，但是on_unpublish钩子删了live表里的直播记录，不合理。
        // execSync(ffmpegSyncCmd);
        // TIP 使用exec，这样命令后面不需要添加：1>/dev/null 2>&1 &，这样每次热更都会重新推流，而且不会触发on_unpublish钩子
        exec(ffmpegCmd);
        console.log(chalkSUCCESS(`FFmpeg推流成功！`), ffmpegCmd);
      } catch (error) {
        console.log(chalkERROR(`FFmpeg推流错误！`), error);
      }
    }
    await liveRoomService.update({
      id: live_room_id,
      cover_img,
      type: LiveRoomTypeEnum.system,
      cdn,
      weight,
      rtmp_url,
      flv_url,
      hls_url,
    });
  }

  if (cdn === 1 && PROJECT_ENV === PROJECT_ENV_ENUM.prod) {
    await tencentcloudUtils.dropLiveStream({
      roomId: live_room_id,
    });
    const { res, err } = await tencentcloudUtils.queryLiveStream({
      roomId: live_room_id,
    });
    if (err) return;
    if (res) {
      rtmp_url = tencentcloudUtils.getPushUrl({
        roomId: live_room_id,
      });
      const pullUrlRes = tencentcloudUtils.getPullUrl({
        roomId: live_room_id,
      });
      flv_url = pullUrlRes.flv;
      hls_url = pullUrlRes.hls;
      await main();
      // 这个不能省，cdn不是推流到srs的，所以不能用不了srs的onpublish回调
      liveService.create({
        live_room_id,
        user_id,
        random_id: '-1',
        socket_id: '-1',
        track_audio: 1,
        track_video: 1,
      });
    }
  }

  if (cdn === 2) {
    const liveRoomInfo = await liveRoomService.findKey(live_room_id);
    // rtmp_url = `${SERVER_LIVE.PushDomain}/${
    //   SERVER_LIVE.AppName
    // }/roomId___${live_room_id}?token=${liveRoomInfo!.key!}`;
    rtmp_url = `${SERVER_LIVE.PushDomain}/${
      SERVER_LIVE.AppName
    }/roomId___${live_room_id}?token=${liveRoomInfo!
      .key!}&random_id=${getRandomString(10)}`;
    flv_url = `${SERVER_LIVE.PullDomain}/${SERVER_LIVE.AppName}/roomId___${live_room_id}.flv`;
    hls_url = `${SERVER_LIVE.PullDomain}/${SERVER_LIVE.AppName}/roomId___${live_room_id}.m3u8`;
    await main();
  }
}

export const initFFmpeg = async (init = true) => {
  if (!init) return;
  // 开发环境的nodemon热更新会导致每次重启后执行initFFmpeg重新推流，但是重启node进程会导致之前的initFFmpeg子进程断掉，也就是会断开推流，导致触发on_publish。
  // 因为断开流的on_publish有延迟，所以重启后执行initFFmpeg了，触发onpublish了，过一会才收到了之前的on_publish，导致出问题（on_publish里会删掉数据库live表的记录）
  // 因此干脆重启一下srs容器？但重启太耗性能了，搞个延迟执行临时解决下先
  // if (PROJECT_ENV === PROJECT_ENV_ENUM.development) {
  // setTimeout(() => {
  //   console.log(chalkWARN('两秒后初始化FFmpeg推流'));
  // }, 500);
  // execSync(`docker restart ${SRS_CONFIG.docker.container}`);
  // await asyncUpdate(() => {
  //   console.log();
  // }, 1000);
  // }
  const flag = ffmpegIsInstalled();
  if (flag) {
    console.log(chalkWARN('ffmpeg已安装，开始运行ffmpeg推流'));
  } else {
    console.log(chalkERROR('未安装ffmpeg！'));
    return;
  }
  try {
    const queue: any[] = [];
    Object.keys(initUser).forEach((item) => {
      queue.push(
        addLive({
          live_room_id: initUser[item].live_room.id,
          user_id: initUser[item].id,
          localFile: initUser[item].live_room.localFile,
          cover_img: initUser[item].live_room.cover_img,
          cdn: initUser[item].live_room.cdn,
          initFFmpeg: initUser[item].live_room.initFFmpeg,
          weight: initUser[item].live_room.weight,
        })
      );
    });
    await Promise.all(queue);
    console.log(chalkSUCCESS(`初始化FFmpeg推流成功！`));

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
    console.log(chalkERROR(`初始化FFmpeg推流错误！`));
    console.log(error);
  }
};
