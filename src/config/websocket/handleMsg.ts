import fs from 'fs';
import path from 'path';

import { filterObj, getRandomString } from 'billd-utils';
import { rimrafSync } from 'rimraf';
import { Server, Socket } from 'socket.io';

import { jwtVerify } from '@/app/auth/authJwt';
import { startBlobIsExistSchedule } from '@/config/schedule/blobIsExist';
import {
  getSocketRealIp,
  getSocketUserAgent,
  ioEmit,
  socketEmit,
} from '@/config/websocket';
import liveRedisController from '@/config/websocket/live-redis.controller';
import {
  DEFAULT_AUTH_INFO,
  MSG_MAX_LENGTH,
  REDIS_PREFIX,
  WEBM_DIR,
} from '@/constant';
import authController from '@/controller/auth.controller';
import deskUserController from '@/controller/deskUser.controller';
import liveController from '@/controller/live.controller';
import liveRoomController from '@/controller/liveRoom.controller';
import redisController from '@/controller/redis.controller';
import userLiveRoomController from '@/controller/userLiveRoom.controller';
import wsMessageController from '@/controller/wsMessage.controller';
import { initUser } from '@/init/initUser';
import { IRedisVal, WsMessageMsgIsVerifyEnum } from '@/interface';
import liveService from '@/service/live.service';
import liveRoomService from '@/service/liveRoom.service';
import { LiveRoomMsgVerifyEnum, LiveRoomTypeEnum } from '@/types/ILiveRoom';
import {
  WsBatchSendOffer,
  WsBilldDeskJoinedType,
  WsBilldDeskJoinType,
  WsBilldDeskStartRemote,
  WsBilldDeskStartRemoteResult,
  WsDisableSpeakingType,
  WsGetLiveUserType,
  WsGetRoomAllUserType,
  WsJoinedType,
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
} from '@/types/websocket';
import { strSlice } from '@/utils';
import { chalkERROR, chalkWARN } from '@/utils/chalkTip';
import { mp4PushRtmp, webmToMp4 } from '@/utils/process';

export async function handleWsJoin(args: {
  io: Server;
  socket: Socket;
  roomId: number;
  data: WsJoinType;
}) {
  const { io, socket, data } = args;
  const { roomId } = args;
  const redisRoomId = roomId;
  if (!roomId) {
    console.log(chalkERROR('roomId为空'));
    return;
  }
  const [liveRoomInfo, liveInfo] = await Promise.all([
    liveRoomService.find(roomId),
    liveController.common.findByLiveRoomId(roomId),
  ]);
  if (!liveRoomInfo) {
    console.log(chalkERROR('liveRoomInfo为空'));
    return;
  }
  socket.join(`${roomId}`);
  console.log(chalkWARN(`${socket.id}进入房间号:${roomId}`));
  const roomsMap = io.of('/').adapter.rooms;
  const socketList = roomsMap.get(`${data.data.live_room_id}`);
  socketEmit<WsJoinedType['data']>({
    socket,
    msgType: WsMsgTypeEnum.joined,
    data: {},
  });
  liveRedisController.setUserJoinedRoom({
    socketId: data.socket_id,
    joinRoomId: redisRoomId,
    userInfo: data.user_info,
    client_ip: getSocketRealIp(socket),
  });
  liveRedisController.setSocketIdJoinLiveRoom({
    socketId: data.socket_id,
    joinRoomId: redisRoomId,
  });
  if (liveInfo) {
    if (liveRoomInfo.type === LiveRoomTypeEnum.system) {
      // socketEmit<WsRoomLivingType['data']>({
      //   socket,
      //   msgType: WsMsgTypeEnum.roomLiving,
      //   data: { live_room_id: roomId },
      // });
      liveRedisController.setUserJoinedRoom({
        socketId: socket.id,
        joinRoomId: redisRoomId,
        userInfo: data.user_info,
        client_ip: getSocketRealIp(socket),
      });
    } else {
      // socketEmit<WsRoomLivingType['data']>({
      //   socket,
      //   msgType: WsMsgTypeEnum.roomLiving,
      //   data: { live_room_id: roomId },
      // });
      liveRedisController.setUserJoinedRoom({
        socketId: socket.id,
        joinRoomId: redisRoomId,
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
      live_room_id: roomId,
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
  const { io, socket, roomId, data } = args;
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

export async function handleWsBilldDeskUpdateUser(args: {
  io: Server;
  socket: Socket;
  data: WsBilldDeskStartRemote;
}) {
  try {
    const { socket, data } = args;
    if (data.data.deskUserUuid) {
      await redisController.setExVal({
        prefix: REDIS_PREFIX.deskUserUuid,
        exp: 10,
        value: {
          socket_id: socket.id,
          deskUserUuid: data.data.deskUserUuid,
          deskUserPassword: data.data.deskUserPassword,
        },
        key: data.data.deskUserUuid,
        client_ip: getSocketRealIp(socket),
      });
      await redisController.setExVal({
        prefix: REDIS_PREFIX.deskUserSocketId,
        exp: 10,
        value: {
          socket_id: socket.id,
          deskUserUuid: data.data.deskUserUuid,
        },
        key: socket.id,
        client_ip: getSocketRealIp(socket),
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function handleWsMessage(args: {
  io: Server;
  socket: Socket;
  data: WsMessageType;
}) {
  const { io, socket, data } = args;
  let liveRoomId = data.data.live_room_id;
  if (data.data.isBilibili && initUser.systemUserBilibili.live_room.id) {
    liveRoomId = initUser.systemUserBilibili.live_room.id;
  }
  if (!liveRoomId) {
    return;
  }
  const res = await liveRedisController.getDisableSpeaking({
    liveRoomId,
    userId: data.user_info?.id || -1,
  });
  if (!res) {
    const liveRoomInfo = await liveRoomController.common.find(liveRoomId);
    const origin_username = data.user_info!.username!;
    const origin_content = data.data.content;
    const content = origin_content;
    const username = origin_username;
    const msgVerify = liveRoomInfo?.msg_verify;
    const user_agent = getSocketUserAgent(socket);
    const msgRes = await wsMessageController.common.create({
      msg_type: data.data.msg_type,
      user_id: data.user_info?.id,
      live_room_id: liveRoomId,
      ip: getSocketRealIp(socket),
      content,
      content_type: data.data.content_type,
      origin_content,
      username,
      origin_username,
      user_agent: strSlice(user_agent, 490),
      send_msg_time: data.time,
      redbag_send_id: data.data.redbag_send_id,
      is_verify:
        msgVerify === LiveRoomMsgVerifyEnum.yes
          ? WsMessageMsgIsVerifyEnum.no
          : WsMessageMsgIsVerifyEnum.yes,
    });
    const data2 = filterObj(data, ['user_token', 'request_id']);
    data2.data.content = content.slice(0, MSG_MAX_LENGTH);
    data2.data.msg_id = msgRes.id;
    ioEmit<any>({
      io,
      roomId: liveRoomId,
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
  const userLiveRoomInfo = await userLiveRoomController.common.findByUserId(
    userId
  );
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

export async function handleWsDisconnecting(args: {
  io: Server;
  socket: Socket;
}) {
  const { io, socket } = args;
  const val = await redisController.getVal({
    prefix: REDIS_PREFIX.deskUserSocketId,
    key: socket.id,
  });
  let remoteDeskUserUuid = '';
  if (val) {
    try {
      remoteDeskUserUuid = JSON.parse(val).value.remoteDeskUserUuid;
    } catch (error) {
      console.log(error);
    }
  }
  if (remoteDeskUserUuid !== '') {
    await Promise.all([
      redisController.del({
        prefix: REDIS_PREFIX.deskUserUuid,
        key: remoteDeskUserUuid,
      }),
      redisController.del({
        prefix: REDIS_PREFIX.deskUserSocketId,
        key: socket.id,
      }),
    ]);
  }
  const res2 = await liveRedisController.getSocketIdJoinLiveRoom();
  res2.forEach((item) => {
    try {
      const res3 = JSON.parse(item);
      if (res3.value.socketId === socket.id) {
        liveRedisController.delUserJoinedRoom({
          socketId: socket.id,
          joinRoomId: res3.value.joinRoomId,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
  const res = await liveRedisController.getSocketIdJoinLiveRoomOne({
    socketId: socket.id,
  });
  try {
    if (res) {
      ioEmit<WsLeavedType['data']>({
        io,
        roomId: res.value.joinRoomId,
        msgType: WsMsgTypeEnum.leaved,
        data: {
          socket_id: socket.id,
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
  await liveRedisController.delSocketIdJoinLiveRoom({
    socketId: socket.id,
  });
  // console.log('socket.rooms', socket.rooms);
  // socket.rooms.forEach((roomIdStr) => {
  //   const roomId = Number(roomIdStr);
  //   if (Number.isNaN(roomId)) return;
  //   liveRedisController
  //     .getUserJoinedRoom({
  //       socketId: socket.id,
  //       joinRoomId: roomId,
  //     })
  //     .then((res1) => {
  //       if (res1) {
  //         const { joinRoomId, userInfo } = res1.value;
  //         try {
  //           liveRedisController.delUserJoinedRoom({
  //             socketId: socket.id,
  //             joinRoomId,
  //           });
  //         } catch (error) {
  //           console.log(error);
  //         }
  //       }
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // });
}

export async function handleWsRoomNoLive(args: {
  socket: Socket;
  data: WsRoomNoLiveType;
}) {
  const { socket, data } = args;
  const roomId = data.data.live_room_id;
  socketEmit<WsRoomNoLiveType['data']>({
    roomId,
    socket,
    msgType: WsMsgTypeEnum.roomNoLive,
    data: { live_room_id: roomId },
  });
  await liveController.common.closeLive(roomId);
}

export async function handleWsStartLive(args: {
  io: Server;
  socket: Socket;
  data: WsStartLiveType;
}) {
  const { socket, data } = args;
  const userId = data.user_info?.id;
  const {
    roomId,
    userLiveRoomInfo,
  }: { roomId: number; userLiveRoomInfo: any } =
    await liveController.common.startLiveUpdateMyLiveRoomInfo({
      userId,
      liveRoomType: data.data.type,
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
      socket_id: data.socket_id,
      track_audio: 1,
      track_video: 1,
      is_tencentcloud_css: 2,
    });
    socketEmit<WsRoomLivingType['data']>({
      msgType: WsMsgTypeEnum.roomLiving,
      roomId,
      socket,
      data: { live_room_id: Number(roomId) },
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
    const liveRoomInfo = await liveRoomService.findKey(roomId);
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
  if (res) {
    liveRedisController.setUserJoinedRoom({
      socketId: data.socket_id,
      joinRoomId: data.data.live_room_id,
      userInfo: data.user_info,
      client_ip: getSocketRealIp(socket),
    });
    liveRedisController.setSocketIdJoinLiveRoom({
      socketId: data.socket_id,
      joinRoomId: data.data.live_room_id,
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

// ======

export async function handleWsBilldDeskJoin(args: {
  io: Server;
  socket: Socket;
  roomId: string;
  data: WsBilldDeskJoinType;
}) {
  const { socket, data } = args;
  const { roomId } = args;
  if (!roomId) {
    console.log(chalkERROR('roomId为空'));
    return;
  }
  socket.join(roomId);
  console.log(chalkWARN(`${socket.id}进入房间号:${roomId}`));
  await redisController.setExVal({
    prefix: REDIS_PREFIX.deskUserUuid,
    exp: 10,
    value: {
      socket_id: socket.id,
      deskUserUuid: data.data.deskUserUuid,
      deskUserPassword: data.data.deskUserPassword,
    },
    key: data.data.deskUserUuid,
    client_ip: getSocketRealIp(socket),
  });
  await redisController.setExVal({
    prefix: REDIS_PREFIX.deskUserSocketId,
    exp: 10,
    value: {
      socket_id: socket.id,
      deskUserUuid: data.data.deskUserUuid,
    },
    key: socket.id,
    client_ip: getSocketRealIp(socket),
  });
  socketEmit<WsBilldDeskJoinedType['data']>({
    socket,
    msgType: WsMsgTypeEnum.billdDeskJoined,
    data: {
      live_room_id: roomId,
    },
  });
}

export async function handleWsBilldDeskStartRemote(args: {
  io: Server;
  socket: Socket;
  data: WsBilldDeskStartRemote;
}) {
  const { socket, data } = args;
  if (!data.data.roomId) {
    console.log('handleWsBilldDeskStartRemote错误，roomId为空');
    return;
  }
  if (
    !data.data.deskUserUuid ||
    !data.data.deskUserPassword ||
    !data.data.remoteDeskUserUuid ||
    !data.data.remoteDeskUserPassword
  ) {
    console.log(
      'deskUserUuid或deskUserPassword或remoteDeskUserUuid或remoteDeskUserPassword为空'
    );
    socketEmit({
      socket,
      msgType: WsMsgTypeEnum.billdDeskStartRemoteResult,
      data: {
        code: 1,
        msg: 'deskUserUuid或deskUserPassword或remoteDeskUserUuid或remoteDeskUserPassword为空',
        data: filterObj(data.data, ['deskUserPassword']),
      },
    });
    return;
  }
  const flag1 = await deskUserController.common.login({
    uuid: data.data.deskUserUuid,
    password: data.data.deskUserPassword,
  });
  if (!flag1) {
    console.log('主控密码错误');
    socketEmit({
      socket,
      msgType: WsMsgTypeEnum.billdDeskStartRemoteResult,
      data: {
        code: 2,
        msg: '主控密码错误',
        data: filterObj(data.data, ['deskUserPassword']),
      },
    });
    return;
  }
  const flag2 = await deskUserController.common.login({
    uuid: data.data.remoteDeskUserUuid,
    password: data.data.remoteDeskUserPassword,
  });
  if (!flag2) {
    console.log('被控密码错误');
    socketEmit({
      socket,
      msgType: WsMsgTypeEnum.billdDeskStartRemoteResult,
      data: {
        code: 3,
        msg: '被控密码错误',
        data: filterObj(data.data, ['deskUserPassword']),
      },
    });
    return;
  }
  const val = await redisController.getVal({
    prefix: REDIS_PREFIX.deskUserUuid,
    key: `${data.data.remoteDeskUserUuid}`,
  });
  if (!val) {
    console.log('remoteDeskUserUuid不在线');
    socketEmit({
      socket,
      msgType: WsMsgTypeEnum.billdDeskStartRemoteResult,
      data: {
        code: 4,
        msg: 'remoteDeskUserUuid不在线',
        data: filterObj(data.data, ['deskUserPassword']),
      },
    });
    return;
  }
  let receiver = '';
  try {
    const cache = JSON.parse(val) as IRedisVal<{
      receiver: string;
      socket_id: string;
      deskUserUuid: string;
      deskUserPassword: string;
      remoteDeskUserUuid: string;
    }>;
    receiver = cache.value.socket_id;
  } catch (error) {
    console.log(error);
  }
  if (receiver === '') {
    console.log('获取remoteDeskUserUuid错误');
    socketEmit({
      roomId: data.data.roomId,
      socket,
      msgType: WsMsgTypeEnum.billdDeskStartRemoteResult,
      data: {
        code: 5,
        msg: '获取remoteDeskUserUuid错误',
        data: filterObj(data.data, ['deskUserPassword']),
      },
    });
    return;
  }
  socketEmit<WsBilldDeskStartRemoteResult['data']>({
    roomId: data.data.roomId,
    socket,
    msgType: WsMsgTypeEnum.billdDeskStartRemoteResult,
    data: {
      code: 0,
      msg: 'ok',
      // @ts-ignore
      data: { ...filterObj(data.data, ['deskUserPassword']), receiver },
    },
  });
  socketEmit<WsBilldDeskStartRemoteResult['data']>({
    socket,
    msgType: WsMsgTypeEnum.billdDeskStartRemoteResult,
    data: {
      code: 0,
      msg: 'ok',
      // @ts-ignore
      data: { ...filterObj(data.data, ['deskUserPassword']), receiver },
    },
  });
}
