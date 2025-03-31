import { exec, spawnSync } from 'child_process';

import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import areaController from '@/controller/area.controller';
import liveController from '@/controller/live.controller';
import liveRoomController from '@/controller/liveRoom.controller';
import srsController from '@/controller/srs.controller';
import tencentcloudCssController from '@/controller/tencentcloudCss.controller';
import { initUser } from '@/init/initUser';
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
  type,
  devFFmpeg,
  prodFFmpeg,
  devFFmpegLocalFile,
  prodFFmpegLocalFile,
  ffmpegParams,
}: {
  live_room_id: number;
  user_id: number;
  type: LiveRoomTypeEnum;
  devFFmpeg: boolean;
  prodFFmpeg: boolean;
  devFFmpegLocalFile: string;
  prodFFmpegLocalFile: string;
  ffmpegParams: Record<string, any>;
}) {
  const liveRoomInfoResult = await liveRoomController.common.findKey(
    live_room_id
  );
  const key = liveRoomInfoResult?.key || '';
  const srsPullRes = srsController.common.getPullUrl({
    liveRoomId: live_room_id,
  });
  const srsPushRes = srsController.common.getPushUrl({
    isdev: PROJECT_ENV === PROJECT_ENV_ENUM.prod ? 'no' : 'yes',
    userId: user_id,
    liveRoomId: live_room_id,
    type: LiveRoomTypeEnum.system,
    key,
  });
  const cdnPullRes = tencentcloudCssUtils.getPullUrl({
    liveRoomId: live_room_id,
  });
  const cdnPushRes = tencentcloudCssUtils.getPushUrl({
    isdev: PROJECT_ENV === PROJECT_ENV_ENUM.prod ? 'no' : 'yes',
    userId: user_id,
    liveRoomId: live_room_id,
    type: LiveRoomTypeEnum.tencentcloud_css,
    key,
  });

  async function main() {
    // 开发环境时判断devFFmpeg，是true的才初始化ffmpeg
    // 生产环境时判断prodFFmpeg，是true的才初始化ffmpeg
    await srsController.common.closeLive({ live_room_id });
    await tencentcloudCssController.common.closeLive({ live_room_id });
    if (
      (PROJECT_ENV === PROJECT_ENV_ENUM.dev && devFFmpeg) ||
      (PROJECT_ENV === PROJECT_ENV_ENUM.beta && devFFmpeg) ||
      (PROJECT_ENV === PROJECT_ENV_ENUM.prod && prodFFmpeg)
    ) {
      const areaRes = await areaController.common.findOneByIdPure(1);
      await liveController.common.startLive({
        user_id,
        live_room_type: type,
        area_id: 1,
        area_name: areaRes.name,
        client_app: -1,
        client_app_version: '',
        client_env: -1,
        client_ip: '',
      });
      // const ffmpegCmd = spawn(`ffmpeg`, [
      //   '-loglevel', // -loglevel quiet不输出log
      //   'quiet',
      //   '-readrate', // 以本地帧频读数据，主要用于模拟捕获设备
      //   'yes',
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
      if (PROJECT_ENV === PROJECT_ENV_ENUM.dev && devFFmpeg) {
        localFile = devFFmpegLocalFile;
      } else if (PROJECT_ENV === PROJECT_ENV_ENUM.beta && devFFmpeg) {
        localFile = devFFmpegLocalFile;
      } else if (PROJECT_ENV === PROJECT_ENV_ENUM.prod && prodFFmpeg) {
        localFile = prodFFmpegLocalFile;
      }
      if (localFile === '') {
        console.error(chalkERROR(`FFmpeg推流错误！`), 'localFile为空');
        return;
      }
      let rtmptoflvurl = cdnPushRes.rtmp_url;
      if (
        [
          LiveRoomTypeEnum.tencentcloud_css,
          LiveRoomTypeEnum.tencentcloud_css_pk,
        ].includes(type)
      ) {
        rtmptoflvurl = cdnPushRes.rtmp_url;
      } else {
        rtmptoflvurl = srsPushRes.rtmp_url;
        // rtmptoflvurl = rtmptoflvurl.replace(
        //   `rtmp://${SRS_CONFIG.PushDomain}`,
        //   'rtmp://localhost'
        // );
      }

      let ffmpegParamsStr = '';
      Object.keys(ffmpegParams).forEach((item) => {
        ffmpegParamsStr += `${item} ${ffmpegParams[item] as string} `;
      });
      // 将最后的空格去掉
      ffmpegParamsStr = ffmpegParamsStr.replace(/ $/g, '');

      /**
       * -preset值：
       * ultrafast: 编码速度最快，文件大小较大，质量较差。
       * superfast: 较快的编码速度，相对较大的文件。
       * veryfast: 快速编码，适合实时应用。
       * faster: 在速度和质量之间取得平衡。
       * fast: 速度和质量的良好权衡。
       * medium: 默认值，适合大多数用途。
       * slow: 质量较高，但编码速度较慢。
       * veryslow: 质量更高，编码速度更慢，适合需要最佳质量的场合。
       * placebo: 质量极高，但速度极慢，通常不推荐用于实际编码。
       */
      // -vcodec libx264，使用H.264编码
      // -preset veryfast，编码速度选项，veryfast 是一个较快的选项，适合实时推流。
      // -tune zerolatency，优化延迟，适合实时流。这个选项优化编码以减少延迟，可能会增加CPU使用率，因为它会影响编码的方式以实现低延迟。
      // -g 1，设置 GOP（Group of Pictures）大小为 1，这样会禁用 B 帧，因为每帧都是 I 帧，每一帧都是关键帧，这会显著增加CPU占用，因为每帧都需要完整编码。
      // -bf 0，禁用 B 帧，设置B帧为0，减少了编码的复杂性，有助于降低CPU占用。
      // -filter:v fps=fps=20:round=down
      // -b:v 1000k，目标平均码率，也即希望得到的输出文件的平均码率（单位 bit/s）。该参数也在二压中被使用。
      // 1. scale=480:-1
      // 含义：将宽度设置为 480 像素，高度将自动计算以保持原始视频的纵横比。
      // 用途：适用于需要保持视频比例的场景，且不特别要求高度必须是偶数。
      // 2. scale=480:-2
      // 含义：将宽度设置为 480 像素，高度自动计算，但确保高度为 2 的倍数。
      // 用途：适用于需要满足编码器要求的场景，特别是某些编码器（如 H.264）要求高度必须是 2 的倍数。
      // WARN 核心是禁用B帧，rtc-rtmp需要禁用b帧，则不能-vcodec copy，需要使用编码
      // const ffmpegCmd = `ffmpeg -loglevel quiet -readrate 1 -stream_loop -1 -i ${localFile} -vcodec copy -acodec copy -f flv '${
      //   rtmptoflvurl
      // }'`;
      // WARN rtmptoflvurl推流到localhost即可，推流到服务器的域名的话，会多一层中转，没必要。
      // CPU 90%+
      // const ffmpegCmd = `ffmpeg -loglevel quiet -readrate 1 -stream_loop -1 -i ${localFile} -vcodec libx264 -preset ultrafast -acodec copy -bf 0 -tune zerolatency -f flv '${rtmptoflvurl}'`;
      // CPU 90%+
      // const ffmpegCmd = `ffmpeg -loglevel quiet -readrate 1 -stream_loop -1 -i ${localFile} -vcodec libx264 -preset ultrafast -acodec copy -bf 0 -f flv '${rtmptoflvurl}'`;
      // CPU 90%+
      // const ffmpegCmd = `ffmpeg -loglevel quiet -readrate 1 -stream_loop -1 -i ${localFile} -vcodec libx264 -preset ultrafast -acodec copy -f flv '${rtmptoflvurl}'`;
      // CPU 60%+
      // const ffmpegCmd = `ffmpeg -loglevel quiet -readrate 1 -stream_loop -1 -i ${localFile} -vcodec libx264 -preset ultrafast -acodec copy -filter:v fps=fps=20:round=down -b:v 1000k -f flv '${rtmptoflvurl}'`;
      // CPU 65%+
      // const ffmpegCmd = `ffmpeg -loglevel quiet -readrate 1 -stream_loop -1 -i ${localFile} -vcodec libx264 -preset ultrafast -acodec copy -bf 0 -tune zerolatency -filter:v fps=fps=20:round=down -b:v 1000k -f flv '${rtmptoflvurl}'`;
      // CPU 50%+
      const ffmpegCmd = `ffmpeg -loglevel quiet -readrate 1 -stream_loop -1 -i ${localFile} -vcodec libx264 -preset ultrafast -acodec copy ${ffmpegParamsStr} -f flv '${rtmptoflvurl}'`;
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
        console.error(chalkERROR(`FFmpeg推流错误！`), error);
      }
    }

    await liveRoomController.common.update({
      id: live_room_id,
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

  if (
    [
      LiveRoomTypeEnum.tencentcloud_css,
      LiveRoomTypeEnum.tencentcloud_css_pk,
    ].includes(type)
  ) {
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
  // if (PROJECT_ENV === PROJECT_ENV_ENUM.dev) {
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
    console.error(chalkERROR('未安装ffmpeg！'));
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
            type: live_room.type!,
            devFFmpeg: live_room.devFFmpeg,
            prodFFmpeg: live_room.prodFFmpeg,
            devFFmpegLocalFile: live_room.devFFmpegLocalFile,
            prodFFmpegLocalFile: live_room.prodFFmpegLocalFile,
            ffmpegParams: live_room.ffmpegParams,
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
    console.error(chalkERROR(`初始化FFmpeg推流错误！`));
    console.log(error);
  }
};
