import fs from 'fs';
import path from 'path';

import { getRandomString } from 'billd-utils';
import nodeSchedule from 'node-schedule';
import { rimrafSync } from 'rimraf';
import { Server, Socket } from 'socket.io';

import { jwtVerify } from '@/app/auth/authJwt';
import { getSocketRealIp, ioEmit, socketEmit } from '@/config/websocket';
import liveRedisController from '@/config/websocket/live-redis.controller';
import {
  DEFAULT_AUTH_INFO,
  MSG_MAX_LENGTH,
  REDIS_PREFIX,
  SCHEDULE_TYPE,
  WEBM_DIR,
} from '@/constant';
import authController from '@/controller/auth.controller';
import liveRoomController from '@/controller/liveRoom.controller';
import redisController from '@/controller/redis.controller';
import srsController from '@/controller/srs.controller';
import wsMessageController from '@/controller/wsMessage.controller';
import { WsMessageMsgIsVerifyEnum } from '@/interface';
import liveService from '@/service/live.service';
import liveRoomService from '@/service/liveRoom.service';
import userLiveRoomService from '@/service/userLiveRoom.service';
import { LiveRoomMsgVerifyEnum, LiveRoomTypeEnum } from '@/types/ILiveRoom';
import {
  WsBatchSendOffer,
  WsDisableSpeakingType,
  WsGetLiveUserType,
  WsGetRoomAllUserType,
  WsJoinType,
  WsLeavedType,
  WsLivePkKeyType,
  WsMessageType,
  WsMsgTypeEnum,
  WsMsrBlobType,
  WsOtherJoinType,
  WsRoomLivingType,
  WsRoomNoLiveType,
  WsStartLiveType,
  WsUpdateJoinInfoType,
  WsUpdateLiveRoomCoverImg,
} from '@/types/websocket';
import { chalkERROR, chalkWARN } from '@/utils/chalkTip';
import { mp4PushRtmp, webmToMp4 } from '@/utils/process';
import { tencentcloudUtils } from '@/utils/tencentcloud';

import { startBlobIsExistSchedule } from '../schedule/blobIsExist';

export async function handleWsJoin(args: {
  io: Server;
  socket: Socket;
  roomId: number;
  data: WsJoinType;
}) {
  const { socket, io, roomId, data } = args;
  if (!roomId) {
    console.log(chalkERROR('roomId为空'));
    return;
  }
  if (data.data.isRemoteDesk) {
    socket.join(`${roomId}`);
    console.log(chalkWARN(`${socket.id}进入房间号:${roomId}`));
    const roomsMap = io.of('/').adapter.rooms;
    const socketList = roomsMap.get(`${data.data.live_room_id}`);
    socketEmit<WsJoinType['data']>({
      socket,
      msgType: WsMsgTypeEnum.joined,
      data: {
        isRemoteDesk: true,
        socket_id: data.socket_id,
        live_room_id: roomId,
        user_info: data.user_info,
        socket_list: socketList ? [...socketList] : [],
      },
    });
    return;
  }
  const [liveRoomInfo, liveInfo] = await Promise.all([
    liveRoomService.find(roomId),
    liveService.findByLiveRoomId(roomId),
  ]);
  if (!liveRoomInfo) {
    console.log(chalkERROR('liveRoomInfo为空'));
    return;
  }
  socket.join(`${roomId}`);
  console.log(chalkWARN(`${socket.id}进入房间号:${roomId}`));
  const roomsMap = io.of('/').adapter.rooms;
  const socketList = roomsMap.get(`${data.data.live_room_id}`);
  socketEmit<WsJoinType['data']>({
    socket,
    msgType: WsMsgTypeEnum.joined,
    data: {
      socket_id: data.socket_id,
      anchor_info: liveRoomInfo.user_live_room!.user,
      live_room_id: roomId,
      live_room: liveRoomInfo,
      user_info: data.user_info,
      socket_list: socketList ? [...socketList] : [],
    },
  });
  liveRedisController.setUserJoinedRoom({
    socketId: data.socket_id,
    joinRoomId: roomId,
    userInfo: data.user_info,
    client_ip: getSocketRealIp(socket),
  });
  if (liveInfo) {
    if (liveRoomInfo.type === LiveRoomTypeEnum.system) {
      socketEmit<WsRoomLivingType['data']>({
        socket,
        msgType: WsMsgTypeEnum.roomLiving,
        data: {
          live_room: liveRoomInfo,
          anchor_socket_id: liveInfo.socket_id!,
          socket_list: socketList ? [...socketList] : [],
        },
      });
      liveRedisController.setUserJoinedRoom({
        socketId: socket.id,
        joinRoomId: roomId,
        userInfo: data.user_info,
        client_ip: getSocketRealIp(socket),
      });
    } else {
      socketEmit<WsRoomLivingType['data']>({
        socket,
        msgType: WsMsgTypeEnum.roomLiving,
        data: {
          live_room: liveRoomInfo,
          anchor_socket_id: liveInfo.socket_id!,
          socket_list: socketList ? [...socketList] : [],
        },
      });
      liveRedisController.setUserJoinedRoom({
        socketId: socket.id,
        joinRoomId: roomId,
        userInfo: data.user_info,
        client_ip: getSocketRealIp(socket),
      });
    }
  }
  socketEmit<WsOtherJoinType['data']>({
    socket,
    msgType: WsMsgTypeEnum.otherJoin,
    roomId,
    data: {
      live_room: liveRoomInfo,
      live_room_user_info: liveRoomInfo.user!,
      join_socket_id: socket.id,
      join_user_info: data.user_info,
      socket_list: socketList ? [...socketList] : [],
    },
  });
}

export function handleWsBatchSendOffer(args: {
  io: Server;
  socket: Socket;
  roomId: number;
  data: WsBatchSendOffer;
}) {
  const { socket, io, roomId, data } = args;
  if (!roomId) {
    console.log(chalkERROR('roomId为空'));
    return;
  }
  const roomsMap = io.of('/').adapter.rooms;
  const socketList = roomsMap.get(`${data.data.roomId}`);

  socketEmit<WsBatchSendOffer['data']>({
    socket,
    msgType: WsMsgTypeEnum.batchSendOffer,
    roomId,
    data: {
      roomId: `${roomId}`,
      socket_list: socketList ? [...socketList] : [],
    },
  });
}

export async function handleWsMessage(args: {
  io: Server;
  socket: Socket;
  data: WsMessageType;
}) {
  const { io, socket, data } = args;
  const res = await liveRedisController.getDisableSpeaking({
    liveRoomId: data.data.live_room_id,
    userId: data.user_info?.id || -1,
  });
  if (!res) {
    const liveRoomInfo = await liveRoomController.common.find(
      data.data.live_room_id
    );
    const origin_username = data.user_info!.username!;
    const origin_content = data.data.msg;
    const content = origin_content;
    const username = origin_username;
    const msgVerify = liveRoomInfo?.msg_verify;
    const msgRes = await wsMessageController.common.create({
      msg_type: data.data.msgType,
      user_id: data.user_info?.id,
      live_room_id: data.data.live_room_id,
      ip: getSocketRealIp(socket),
      content,
      origin_content,
      username,
      origin_username,
      msg_is_file: data.data.msgIsFile,
      user_agent: data.data.user_agent,
      send_msg_time: data.data.send_msg_time,
      redbag_send_id: data.data.redbag_send_id,
      is_verify:
        msgVerify === LiveRoomMsgVerifyEnum.yes
          ? WsMessageMsgIsVerifyEnum.no
          : WsMessageMsgIsVerifyEnum.yes,
    });
    const data2 = { ...data };
    data2.data.msg = content.slice(0, MSG_MAX_LENGTH);
    data2.data.username = username;
    data2.data.msg_id = msgRes.id;
    ioEmit<any>({
      io,
      roomId: data.data.live_room_id,
      msgType: WsMsgTypeEnum.message,
      data: data2,
    });
  } else {
    io.sockets.sockets.forEach((socketItem) => {
      if (socketItem.id === data.socket_id) {
        socketEmit<any>({
          socket: socketItem,
          msgType: WsMsgTypeEnum.disableSpeaking,
          data: {
            ...data.data,
            request_id: data.request_id,
            disable_expired_at: res.expired_at,
            is_disable_speaking: true,
          },
        });
      }
    });
  }
}

export async function handleWsMsrBlob(args: { data: WsMsrBlobType }) {
  const { data } = args;
  const userId = data.user_info?.id;
  if (!userId) {
    console.log(chalkERROR('userId为空'));
    return;
  }
  const userLiveRoomInfo = await userLiveRoomService.findByUserId(userId);
  if (!userLiveRoomInfo) {
    console.log(chalkERROR('userLiveRoomInfo为空'));
    return;
  }
  const roomId = userLiveRoomInfo.live_room_id!;
  const roomDir = path.resolve(WEBM_DIR, `roomId_${roomId}`);
  const fileDir = `${roomDir}/file`;
  const fileResDir = `${fileDir}/res`;
  const fileTmpDir = `${fileDir}/tmp`;
  const webmFile = `${fileTmpDir}/${data.data.blob_id}.webm`;
  const mp4File = `${fileResDir}/${data.data.blob_id}.mp4`;
  if (!fs.existsSync(WEBM_DIR)) {
    fs.mkdirSync(WEBM_DIR);
  }
  if (!fs.existsSync(roomDir)) {
    fs.mkdirSync(roomDir);
  }
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir);
  }
  if (!fs.existsSync(fileTmpDir)) {
    fs.mkdirSync(fileTmpDir);
  }
  fs.writeFileSync(webmFile, data.data.blob);
  webmToMp4({
    input: webmFile,
    output: mp4File,
  });
  if (fs.existsSync(webmFile)) {
    rimrafSync(webmFile);
  }
}

export function handleWsDisconnecting(args: { io: Server; socket: Socket }) {
  const { io, socket } = args;
  socket.rooms.forEach((roomIdStr) => {
    const roomId = Number(roomIdStr);
    if (Number.isNaN(roomId)) return;
    liveRedisController
      .getUserJoinedRoom({
        socketId: socket.id,
        joinRoomId: roomId,
      })
      .then(async (res1) => {
        if (res1) {
          const { joinRoomId, userInfo } = res1.value;
          try {
            liveRedisController.delUserJoinedRoom({
              socketId: socket.id,
              joinRoomId,
            });
          } catch (error) {
            console.log(error);
          }
          ioEmit<WsLeavedType['data']>({
            io,
            roomId: joinRoomId,
            msgType: WsMsgTypeEnum.leaved,
            data: {
              socket_id: socket.id,
              user_info: userInfo,
            },
          });
          const userId = userInfo?.id;
          if (!userId) {
            console.log(chalkERROR('userId为空'));
            return;
          }
          const userLiveRoomInfo = await userLiveRoomService.findByUserId(
            userId
          );
          if (userLiveRoomInfo) {
            liveService.deleteByLiveRoomIdAndSocketId({
              live_room_id: userLiveRoomInfo.live_room_id!,
              socket_id: socket.id,
            });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

export async function handleWsRoomNoLive(args: {
  socket: Socket;
  data: WsRoomNoLiveType;
}) {
  const { socket, data } = args;
  const userId = data.user_info?.id;
  if (!userId) {
    console.log(chalkERROR('userId为空'));
    return;
  }
  const userLiveRoomInfo = await userLiveRoomService.findByUserId(userId);
  if (!userLiveRoomInfo) {
    console.log(chalkERROR('userLiveRoomInfo为空'));
    return;
  }
  const roomId = userLiveRoomInfo.live_room_id!;
  socketEmit<WsRoomNoLiveType['data']>({
    roomId,
    socket,
    msgType: WsMsgTypeEnum.roomNoLive,
    data: { live_room: userLiveRoomInfo.live_room! },
  });
  tencentcloudUtils.dropLiveStream({
    roomId,
  });
  liveService.deleteByLiveRoomId(roomId);
  console.log('收到主播断开直播，删除直播间的webm目录');
  nodeSchedule.cancelJob(`${SCHEDULE_TYPE.blobIsExist}___${roomId}`);
  const roomDir = path.resolve(WEBM_DIR, `roomId_${roomId}`);
  if (fs.existsSync(roomDir)) {
    rimrafSync(roomDir);
  }
}

export async function handleWsStartLive(args: {
  io: Server;
  socket: Socket;
  data: WsStartLiveType;
}) {
  const { io, socket, data } = args;
  const userId = data.user_info?.id;
  if (!userId) {
    console.log(chalkERROR('userId为空'));
    return;
  }
  const userLiveRoomInfo = await userLiveRoomService.findByUserId(userId);
  if (!userLiveRoomInfo) {
    console.log(chalkERROR('userLiveRoomInfo为空'));
    return;
  }
  const roomId = userLiveRoomInfo.live_room_id!;
  const liveRoomInfo = await liveRoomService.findKey(roomId);
  let pullRes: {
    rtmp: string;
    flv: string;
    hls: string;
    webrtc: string;
  };
  if (
    [LiveRoomTypeEnum.tencent_css, LiveRoomTypeEnum.tencent_css_pk].includes(
      data.data.type
    )
  ) {
    pullRes = tencentcloudUtils.getPullUrl({
      roomId,
    });
  } else {
    pullRes = srsController.common.getPullUrl(roomId);
  }

  liveRoomService.update({
    id: roomId,
    name: data.data.name,
    type: data.data.type,
    rtmp_url: pullRes.rtmp,
    flv_url: pullRes.flv,
    hls_url: pullRes.hls,
  });
  liveRedisController.setLiveRoomIsLiving({
    socketId: data.socket_id,
    liveRoomId: Number(roomId),
    client_ip: getSocketRealIp(socket),
  });
  if (
    data.data.type === LiveRoomTypeEnum.wertc_live ||
    data.data.type === LiveRoomTypeEnum.wertc_meeting_one
  ) {
    await liveService.create({
      live_room_id: Number(roomId),
      user_id: userId,
      socket_id: data.socket_id,
      track_audio: 1,
      track_video: 1,
      is_tencentcloud_css: 2,
    });
    const roomsMap = io.of('/').adapter.rooms;
    const socketList = roomsMap.get(`${roomId}`);
    socketEmit<WsRoomLivingType['data']>({
      msgType: WsMsgTypeEnum.roomLiving,
      roomId,
      socket,
      data: {
        live_room: userLiveRoomInfo.live_room!,
        anchor_socket_id: data.socket_id,
        socket_list: socketList ? [...socketList] : [],
      },
    });
  } else if (data.data.type === LiveRoomTypeEnum.msr) {
    /**
     * 业务设计：
     * 1，客户端开始msr直播，携带delay、max_delay参数
     * 2，客户端每delay毫秒发送一次webm，携带blob_id、delay、max_delay参数。blob_id即当前发送的是第几个webm
     * 3，服务端接收到webm就进行转码，转码成mp4，并且每max_delay毫秒进行一次合并mp4
     * 4，实际的推流命令，里面的文件列表就是转码后的mp4文件列表
     * 5，(max_delay * 2)毫秒后，执行推流命令
     * 具体实现：
     * 1，客户端开始msr直播，携带delay、max_delay参数，假设delay是1000；max_delay是5000
     * 2，服务端收到客户端开始msr直播后，直接生成理论上24小时的推流文件（24小时内所有的mp4文件列表）
     * 3，直接算出来理论上需要多少个webm文件，(1000*60*60*24) / 1000 = 86400，也就是需要86400个webm文件
     * 3，直接算出来理论上需要多少个mp4文件，(1000*60*60*24) / 5000 = 17280，也就是需要17280个mp4文件
     * 4，客户端每1000毫秒发送一次webm，服务端收到后，转码成mp4，存到mp4目录，存放位置为[roomId]/tmpMp4/[blob_id]
     * 5，因为网络等因素影响，服务端不能依赖收到客户端发送的webm再进行业务处理，服务端收到msr直播命令了，就开始定时任务，
     * 每5000毫秒合并一次tmpMp4目录里的所有mp4，生成在[roomId]/resMp4/目录，
     * 服务端每n*4毫秒进行一次合并mp4，正常情况下，每n*4毫秒，能收到4个webm，转码后也就是4个mp4
     * 但是如果各种因素（网络差，转码慢等等）导致每n*4毫秒的时候，
     * 实际的推流文件是每n*4毫秒的mp4文件列表
     */
    const msrDelay = data.data.msrDelay || 1000;
    const msrMaxDelay = data.data.msrMaxDelay || 5000; // 值越大，延迟越高，但抗网络抖动越强
    if (msrDelay > 1000 * 5 || !Number.isInteger(msrDelay / 1000)) {
      console.log(chalkERROR('msrDelay错误！'));
      return;
    }
    // 假设每个webm是1秒钟，转码成mp4需要翻三倍时间，即3秒。因此msrMaxDelay不能小于这个翻倍间隔
    if (msrMaxDelay < msrDelay * 3 || !Number.isInteger(msrMaxDelay / 1000)) {
      console.log(chalkERROR('msrMaxDelay错误！'));
      return;
    }
    const roomDir = path.resolve(WEBM_DIR, `roomId_${roomId}`);
    const fileDir = `${roomDir}/file`;
    const fileResDir = `${fileDir}/res`;
    const txtFile = `${roomDir}/list.txt`;
    console.log('收到主播开始msr直播，删除直播间的webm目录');
    if (fs.existsSync(roomDir)) {
      rimrafSync(roomDir);
    }
    let str = '';
    const allTime = 1000 * 60 * 60 * 24; // 24小时对应的毫秒数
    for (let i = 1; i <= allTime / msrDelay; i += 1) {
      str += `${i !== 1 ? '\n' : ''}file '${fileResDir}/${i}.mp4'`;
    }
    if (!fs.existsSync(WEBM_DIR)) {
      fs.mkdirSync(WEBM_DIR);
    }
    if (!fs.existsSync(roomDir)) {
      fs.mkdirSync(roomDir);
    }
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir);
    }
    if (!fs.existsSync(fileResDir)) {
      fs.mkdirSync(fileResDir);
    }

    fs.writeFileSync(txtFile, str);
    setTimeout(() => {
      startBlobIsExistSchedule({
        roomId,
        msrDelay: data.data.msrDelay,
        msrMaxDelay: data.data.msrMaxDelay,
      });
    }, msrMaxDelay / 2);
    setTimeout(() => {
      mp4PushRtmp({
        txt: txtFile,
        rtmpUrl: userLiveRoomInfo.live_room!.rtmp_url!,
        token: liveRoomInfo!.key!,
      });
    }, msrMaxDelay);
  } else if (
    data.data.type === LiveRoomTypeEnum.pk ||
    data.data.type === LiveRoomTypeEnum.tencent_css_pk
  ) {
    try {
      const pkKey = getRandomString(8);
      await redisController.setExVal({
        prefix: REDIS_PREFIX.livePkKey,
        exp: 60 * 5,
        value: { key: pkKey },
        key: `${roomId}`,
        client_ip: getSocketRealIp(socket),
      });
      socketEmit<WsLivePkKeyType['data']>({
        socket,
        msgType: WsMsgTypeEnum.livePkKey,
        data: {
          live_room_id: roomId,
          key: pkKey,
        },
      });
    } catch (error) {
      console.error('user_pk错误');
      console.error(error);
    }
  }
}

export async function handleWsUpdateLiveRoomCoverImg(
  data: WsUpdateLiveRoomCoverImg
) {
  const userId = data.user_info?.id;
  if (!userId) {
    console.log(chalkERROR('userId为空'));
    return;
  }
  const userLiveRoomInfo = await userLiveRoomService.findByUserId(userId);
  if (!userLiveRoomInfo) {
    console.log(chalkERROR('userLiveRoomInfo为空'));
    return;
  }
  const roomId = userLiveRoomInfo.live_room_id!;
  liveRoomService.update({
    id: roomId,
    cover_img: data.data.cover_img,
  });
}

export async function handleWsGetLiveUser(args: {
  socket: Socket;
  data: WsGetLiveUserType;
}) {
  const { socket, data } = args;
  const liveUser = await liveRedisController.getLiveRoomOnlineUser(
    data.data.live_room_id
  );
  socketEmit<WsGetRoomAllUserType['data']>({
    socket,
    msgType: WsMsgTypeEnum.liveUser,
    data: {
      liveUser,
    },
  });
}

export async function handleWsUpdateJoinInfo(args: {
  socket: Socket;
  data: WsUpdateJoinInfoType;
}) {
  const { socket, data } = args;
  const res = await liveRedisController.getUserJoinedRoom({
    socketId: data.socket_id,
    joinRoomId: data.data.live_room_id,
  });
  liveRoomService.update({
    id: data.data.live_room_id,
  });
  if (data.data.track) {
    liveService.updateByRoomId({
      live_room_id: data.data.live_room_id,
      track_audio: data.data.track.audio,
      track_video: data.data.track.video,
    });
  }
  if (res) {
    liveRedisController.setUserJoinedRoom({
      socketId: data.socket_id,
      joinRoomId: data.data.live_room_id,
      userInfo: data.user_info,
      client_ip: getSocketRealIp(socket),
    });
  }
}

export async function handleWsDisableSpeaking(args: {
  io: Server;
  socket: Socket;
  data: WsDisableSpeakingType;
}) {
  const { io, socket, data } = args;
  if (!data.user_token) {
    return;
  }
  const { userInfo } = await jwtVerify(data.user_token);
  if (!userInfo?.id) {
    return;
  }
  const auths = await authController.common.getUserAuth(userInfo.id);
  const hasAuth = auths.find(
    (v) => v.auth_value === DEFAULT_AUTH_INFO.MESSAGE_DISABLE.auth_value
  );
  if (hasAuth) {
    if (data.data.restore) {
      await liveRedisController.clearDisableSpeaking({
        userId: data.data.user_id,
        liveRoomId: data.data.live_room_id,
      });
      ioEmit<WsDisableSpeakingType['data']>({
        io,
        msgType: WsMsgTypeEnum.disableSpeaking,
        data: {
          ...data.data,
          restore_disable_ok: true,
          request_id: data.request_id,
        },
      });
    } else {
      const exp = data.data.duration || 60 * 5;
      await liveRedisController.setDisableSpeaking({
        userId: data.data.user_id,
        liveRoomId: data.data.live_room_id,
        exp,
        client_ip: getSocketRealIp(socket),
      });
      socketEmit<WsDisableSpeakingType['data']>({
        socket,
        msgType: WsMsgTypeEnum.disableSpeaking,
        data: {
          ...data.data,
          disable_ok: true,
          request_id: data.request_id,
        },
      });
      ioEmit<WsDisableSpeakingType['data']>({
        io,
        msgType: WsMsgTypeEnum.disableSpeaking,
        data: {
          ...data.data,
          disable_expired_at: +new Date() + exp * 1000,
          is_disable_speaking: true,
          request_id: data.request_id,
        },
      });
    }
  }
}
