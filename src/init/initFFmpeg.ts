import { exec, spawnSync } from 'child_process';

import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import srsController from '@/controller/srs.controller';
import { initUser } from '@/init/initUser';
import liveService from '@/service/live.service';
import liveRoomService from '@/service/liveRoom.service';
import {
  LiveRoomPullIsShouldAuthEnum,
  LiveRoomTypeEnum,
  LiveRoomUseCDNEnum,
} from '@/types/ILiveRoom';
import { chalkERROR, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';
import { tencentcloudUtils } from '@/utils/tencentcloud';

function ffmpegIsInstalled() {
  const res = spawnSync('ffmpeg', ['-version']);
  // console.log('ffmpegIsInstalled', res, res.status);
  if (res.status !== 0) {
    return false;
  }
  return true;
}

async function addLive({
  live_room_id,
  name,
  desc,
  cdn,
  type,
  priority,
  pull_is_should_auth,
  cover_img,
  devFFmpeg,
  prodFFmpeg,
  devFFmpegLocalFile,
  prodFFmpegLocalFile,
}: {
  live_room_id: number;
  user_id: number;
  name: string;
  desc: string;
  type: LiveRoomTypeEnum;
  cdn: LiveRoomUseCDNEnum;
  priority: number;
  pull_is_should_auth: LiveRoomPullIsShouldAuthEnum;
  cover_img: string;
  devFFmpeg: boolean;
  prodFFmpeg: boolean;
  devFFmpegLocalFile: string;
  prodFFmpegLocalFile: string;
}) {
  const liveRoomInfo = await liveRoomService.findKey(live_room_id);
  const key = liveRoomInfo?.key;
  const srsPullRes = srsController.common.getPullUrl({
    liveRoomId: live_room_id,
  });
  const srsPushRes = srsController.common.getPushUrl({
    liveRoomId: live_room_id,
    type: LiveRoomTypeEnum.system,
    key: key!,
  });
  const cdnPullRes = tencentcloudUtils.getPullUrl({
    liveRoomId: live_room_id,
  });
  const cdnPushRes = tencentcloudUtils.getPushUrl({
    liveRoomId: live_room_id,
    type: LiveRoomTypeEnum.tencent_css,
    key: key!,
  });

  async function main() {
    await liveService.deleteByLiveRoomId(live_room_id);
    // 开发环境时判断devFFmpeg，是true的才初始化ffmpeg
    // 生产环境时判断prodFFmpeg，是true的才初始化ffmpeg
    if (
      (PROJECT_ENV === PROJECT_ENV_ENUM.development && devFFmpeg) ||
      (PROJECT_ENV === PROJECT_ENV_ENUM.prod && prodFFmpeg)
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
      let localFile = '';
      if (PROJECT_ENV === PROJECT_ENV_ENUM.development && devFFmpeg) {
        localFile = devFFmpegLocalFile;
      } else if (PROJECT_ENV === PROJECT_ENV_ENUM.prod && prodFFmpeg) {
        localFile = prodFFmpegLocalFile;
      }
      if (localFile === '') {
        console.log(chalkERROR(`FFmpeg推流错误！`), 'localFile为空');
        return;
      }
      const ffmpegCmd = `ffmpeg -loglevel quiet -readrate 1 -stream_loop -1 -i ${localFile} -vcodec copy -acodec copy -f flv '${
        cdn === LiveRoomUseCDNEnum.yes
          ? cdnPushRes.push_rtmp_url
          : srsPushRes.push_rtmp_url
      }'`;
      // const ffmpegSyncCmd = `${ffmpegCmd} 1>/dev/null 2>&1 &`;
      try {
        // WARN 使用execSync的话，命令最后需要添加：1>/dev/null 2>&1 &，否则会自动退出进程；
        // 但是本地开发环境的时候，因为nodemon的缘故，每次热更新后，在ffmpeg推完流后，触发on_unpublish钩子，删除了live表里的直播记录
        // 实际上本地还在推流，但是on_unpublish钩子删了live表里的直播记录，不合理。
        // execSync(ffmpegSyncCmd);
        // TIP 使用exec，这样命令后面不需要添加：1>/dev/null 2>&1 &，这样每次热更都会重新推流，而且不会触发on_unpublish钩子
        exec(ffmpegCmd);
        console.log(
          chalkSUCCESS(`FFmpeg推流成功！roomId：${live_room_id}`),
          ffmpegCmd.replace(' -loglevel quiet', '')
        );
      } catch (error) {
        console.log(chalkERROR(`FFmpeg推流错误！`), error);
      }
    }
    await liveRoomService.update({
      id: live_room_id,
      name,
      desc,
      cdn,
      pull_is_should_auth,
      priority,
      cover_img,
      rtmp_url: srsPullRes.rtmp,
      flv_url: srsPullRes.flv,
      hls_url: srsPullRes.hls,
      webrtc_url: srsPullRes.webrtc,
      push_rtmp_url: srsPushRes.push_rtmp_url,
      push_obs_server: srsPushRes.push_obs_server,
      push_obs_stream_key: srsPushRes.push_obs_stream_key,
      push_webrtc_url: srsPushRes.push_webrtc_url,
      push_srt_url: srsPushRes.push_srt_url,
      cdn_rtmp_url: cdnPullRes.rtmp,
      cdn_flv_url: cdnPullRes.flv,
      cdn_hls_url: cdnPullRes.hls,
      cdn_webrtc_url: cdnPullRes.webrtc,
      cdn_push_rtmp_url: cdnPushRes.push_rtmp_url,
      cdn_push_obs_server: cdnPushRes.push_obs_server,
      cdn_push_obs_stream_key: cdnPushRes.push_obs_stream_key,
      cdn_push_webrtc_url: cdnPushRes.push_webrtc_url,
      cdn_push_srt_url: cdnPushRes.push_srt_url,
      type,
    });
  }

  if (cdn === LiveRoomUseCDNEnum.yes) {
    if (PROJECT_ENV !== PROJECT_ENV_ENUM.prod) {
      return;
    }
    await tencentcloudUtils.dropLiveStream({
      roomId: live_room_id,
    });
    const { res, err } = await tencentcloudUtils.queryLiveStream({
      roomId: live_room_id,
    });
    console.log('tencentcloudUtils.queryLiveStream');
    console.log(err, res);
    if (err) return;
    if (res) {
      await main();
    }
  } else {
    await main();
  }
}

export const initFFmpeg = async (init = true) => {
  if (!init) return;
  // 开发环境的nodemon热更新会导致每次重启后执行initFFmpeg重新推流，但是重启node进程会导致之前的initFFmpeg子进程断掉，也就是会断开推流，导致触发on_publish。
  // 因为断开流的on_publish有延迟，所以重启后执行initFFmpeg了，触发onpublish了，过一会才收到了之前的on_publish，导致出问题（on_publish里会删掉数据库live表的记录）
  // 因此干脆重启一下srs容器？但重启太耗性能了，搞个延迟执行临时解决下先
  // if (PROJECT_ENV === PROJECT_ENV_ENUM.development) {
  //   setTimeout(() => {
  //     console.log(chalkWARN('两秒后初始化FFmpeg推流'));
  //   }, 500);
  //   // execSync(`docker restart ${SRS_CONFIG.docker.container}`);
  //   // await asyncUpdate(() => {
  //   //   console.log();
  //   // }, 2000);
  // }
  const flag = ffmpegIsInstalled();
  if (flag) {
    console.log(chalkWARN('ffmpeg已安装，开始运行ffmpeg推流'));
  } else {
    console.log(chalkERROR('未安装ffmpeg！'));
    return;
  }
  try {
    // 踢掉所有直播
    const res = await srsController.common.getApiV1Clients({
      start: 0,
      count: 9999,
    });
    const oldClientsQueue: any[] = [];
    res.clients.forEach((item) => {
      oldClientsQueue.push(srsController.common.deleteApiV1Clients(item.id));
    });
    await Promise.all(oldClientsQueue);
    const queue: any[] = [];
    Object.keys(initUser).forEach((item) => {
      queue.push(
        addLive({
          live_room_id: initUser[item].live_room.id!,
          user_id: initUser[item].id!,
          name: initUser[item].live_room.name!,
          desc: initUser[item].live_room.desc!,
          cdn: initUser[item].live_room.cdn!,
          type:
            initUser[item].live_room.type === undefined
              ? LiveRoomTypeEnum.system
              : initUser[item].live_room.type!,
          priority: initUser[item].live_room.priority!,
          pull_is_should_auth: initUser[item].live_room.pull_is_should_auth!,
          cover_img: initUser[item].live_room.cover_img!,
          devFFmpeg: initUser[item].live_room.devFFmpeg,
          prodFFmpeg: initUser[item].live_room.prodFFmpeg,
          devFFmpegLocalFile: initUser[item].live_room.devFFmpegLocalFile,
          prodFFmpegLocalFile: initUser[item].live_room.prodFFmpegLocalFile,
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
