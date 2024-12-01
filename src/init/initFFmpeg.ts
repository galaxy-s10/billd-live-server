import { exec, spawnSync } from 'child_process';

import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import liveRoomController from '@/controller/liveRoom.controller';
import srsController from '@/controller/srs.controller';
import tencentcloudCssController from '@/controller/tencentcloudCss.controller';
import { initUser } from '@/init/initUser';
import { SwitchEnum } from '@/interface';
import { LiveRoomTypeEnum } from '@/types/ILiveRoom';
import { chalkERROR, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';
import { tencentcloudCssUtils } from '@/utils/tencentcloud-css';

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
  user_id,
  cdn,
  type,
  devFFmpeg,
  prodFFmpeg,
  devFFmpegLocalFile,
  prodFFmpegLocalFile,
}: {
  live_room_id: number;
  user_id: number;
  cdn: SwitchEnum;
  type: LiveRoomTypeEnum;
  devFFmpeg: boolean;
  prodFFmpeg: boolean;
  devFFmpegLocalFile: string;
  prodFFmpegLocalFile: string;
}) {
  const liveRoomInfoResult = await liveRoomController.common.findKey(
    live_room_id
  );
  const key = liveRoomInfoResult?.key || '';
  const srsPullRes = srsController.common.getPullUrl({
    liveRoomId: live_room_id,
  });
  const srsPushRes = srsController.common.getPushUrl({
    userId: user_id,
    liveRoomId: live_room_id,
    type: LiveRoomTypeEnum.system,
    key,
  });
  const cdnPullRes = tencentcloudCssUtils.getPullUrl({
    liveRoomId: live_room_id,
  });
  const cdnPushRes = tencentcloudCssUtils.getPushUrl({
    userId: user_id,
    liveRoomId: live_room_id,
    type: LiveRoomTypeEnum.tencent_css,
    key,
  });

  async function main() {
    // 开发环境时判断devFFmpeg，是true的才初始化ffmpeg
    // 生产环境时判断prodFFmpeg，是true的才初始化ffmpeg
    await srsController.common.closeLive({ live_room_id });
    await tencentcloudCssController.common.closeLive({ live_room_id });
    if (
      (PROJECT_ENV === PROJECT_ENV_ENUM.development && devFFmpeg) ||
      (PROJECT_ENV === PROJECT_ENV_ENUM.beta && devFFmpeg) ||
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
      } else if (PROJECT_ENV === PROJECT_ENV_ENUM.beta && devFFmpeg) {
        localFile = devFFmpegLocalFile;
      } else if (PROJECT_ENV === PROJECT_ENV_ENUM.prod && prodFFmpeg) {
        localFile = prodFFmpegLocalFile;
      }
      if (localFile === '') {
        console.log(chalkERROR(`FFmpeg推流错误！`), 'localFile为空');
        return;
      }
      // -preset veryfast，编码速度选项，veryfast 是一个较快的选项，适合实时推流。
      // -tune zerolatency，优化延迟，适合实时流。
      // -g 1，设置 GOP（Group of Pictures）大小为 1，这样会禁用 B 帧，因为每帧都是 I 帧
      // -bf 0，禁用 B 帧
      // WARN 核心是禁用B帧
      const ffmpegCmd = `ffmpeg -loglevel quiet -readrate 1 -stream_loop -1 -i ${localFile} -vcodec libx264 -preset veryfast -tune zerolatency -bf 0 -g 1 -acodec copy -f flv '${
        cdn === SwitchEnum.yes ? cdnPushRes.rtmp_url : srsPushRes.rtmp_url
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

    await liveRoomController.common.update({
      id: live_room_id,
      cdn,
      type,

      pull_rtmp_url: srsPullRes.rtmp,
      pull_flv_url: srsPullRes.flv,
      pull_hls_url: srsPullRes.hls,
      pull_webrtc_url: srsPullRes.webrtc,

      pull_cdn_rtmp_url: cdnPullRes.rtmp,
      pull_cdn_flv_url: cdnPullRes.flv,
      pull_cdn_hls_url: cdnPullRes.hls,
      pull_cdn_webrtc_url: cdnPullRes.webrtc,

      push_rtmp_url: srsPushRes.rtmp_url,
      push_obs_server: srsPushRes.obs_server,
      push_obs_stream_key: srsPushRes.obs_stream_key,
      push_webrtc_url: srsPushRes.webrtc_url,
      push_srt_url: srsPushRes.srt_url,

      push_cdn_rtmp_url: cdnPushRes.rtmp_url,
      push_cdn_obs_server: cdnPushRes.obs_server,
      push_cdn_obs_stream_key: cdnPushRes.obs_stream_key,
      push_cdn_webrtc_url: cdnPushRes.webrtc_url,
      push_cdn_srt_url: cdnPushRes.srt_url,
    });
  }

  if (cdn === SwitchEnum.yes) {
    if (PROJECT_ENV !== PROJECT_ENV_ENUM.prod) {
      return;
    }
    await tencentcloudCssUtils.dropLiveStream({
      roomId: live_room_id,
    });
    const { res, err } = await tencentcloudCssUtils.queryLiveStream({
      roomId: live_room_id,
    });
    console.log('tencentcloudCssUtils.queryLiveStream');
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
      const { live_room } = initUser[item];
      if (live_room) {
        queue.push(
          addLive({
            live_room_id: live_room.id!,
            user_id: initUser[item].id!,
            cdn: live_room.cdn!,
            type: live_room.type!,
            devFFmpeg: live_room.devFFmpeg,
            prodFFmpeg: live_room.prodFFmpeg,
            devFFmpegLocalFile: live_room.devFFmpegLocalFile,
            prodFFmpegLocalFile: live_room.prodFFmpegLocalFile,
          })
        );
      }
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
