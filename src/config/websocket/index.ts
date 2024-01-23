import fs from 'fs';
import path from 'path';

import { getRandomString } from 'billd-utils';
import nodeSchedule from 'node-schedule';
import { rimrafSync } from 'rimraf';
import { Server, Socket } from 'socket.io';

import { jwtVerify } from '@/app/auth/authJwt';
import { startBlobIsExistSchedule } from '@/config/schedule/blobIsExist';
import liveRedisController from '@/config/websocket/live-redis.controller';
import {
  DEFAULT_AUTH_INFO,
  MSG_MAX_LENGTH,
  PROJECT_ENV,
  PROJECT_ENV_ENUM,
  REDIS_PREFIX,
  SCHEDULE_TYPE,
  WEBM_DIR,
} from '@/constant';
import AuthController from '@/controller/auth.controller';
import liveRoomController from '@/controller/liveRoom.controller';
import redisController from '@/controller/redis.controller';
import wsMessageController from '@/controller/wsMessage.controller';
import { WsMessageMsgIsVerifyEnum } from '@/interface';
import liveService from '@/service/live.service';
import liveRoomService from '@/service/liveRoom.service';
import userLiveRoomService from '@/service/userLiveRoom.service';
import { LiveRoomMsgVerifyEnum, LiveRoomTypeEnum } from '@/types/ILiveRoom';
import {
  WSGetRoomAllUserType,
  WSLivePkKeyType,
  WsAnswerType,
  WsCandidateType,
  WsConnectStatusEnum,
  WsDisableSpeakingType,
  WsGetLiveUserType,
  WsHeartbeatType,
  WsJoinType,
  WsLeavedType,
  WsMessageType,
  WsMsgTypeEnum,
  WsMsrBlobType,
  WsOfferType,
  WsOtherJoinType,
  WsRoomLivingType,
  WsRoomNoLiveType,
  WsStartLiveType,
  WsUpdateJoinInfoType,
} from '@/types/websocket';
import {
  chalkERROR,
  chalkINFO,
  chalkSUCCESS,
  chalkWARN,
} from '@/utils/chalkTip';
import { mp4PushRtmp, webmToMp4 } from '@/utils/process';

function getSocketRealIp(socket?: Socket) {
  if (!socket) {
    return '-1';
  }
  const realIp = socket.handshake.headers['x-real-ip'] as string;
  return realIp || '-1';
}

// 获取所有连接的socket客户端
async function getAllSockets(io) {
  const allSocketsMap = await io.fetchSockets();
  const res = Object.keys(allSocketsMap).map((item) => {
    return {
      id: allSocketsMap[item].id,
      rooms: [...allSocketsMap[item].rooms.values()],
    };
  });
  return res;
}

// 获取某个房间的所有用户
async function getRoomAllUser(io, roomId: number) {
  const res1 = await getAllSockets(io);
  const res2 = res1.filter((item) => {
    return item.rooms.includes(`${roomId}`);
  });
  return res2;
}

// async function getAllLiveUser(io) {
//   const allSocketsMap = await io.fetchSockets();
//   const res = Object.keys(allSocketsMap).map((item) => {
//     return {
//       id: allSocketsMap[item].id,
//       rooms: [...allSocketsMap[item].rooms.values()],
//     };
//   });
//   const promise1: Promise<{
//     value: {
//       roomId: number;
//       socketId: string;
//       userInfo: IUser;
//     };
//     created_at?: number;
//     expired_at?: number;
//   } | null>[] = [];
//   res.forEach((item) => {
//     promise1.push(
//       liveRedisController.getUserJoinedRoom({
//         socketId: item.id,
//       })
//     );
//   });
//   const res1 = await Promise.all(promise1);
//   const newRes = res.map((item, index) => {
//     return { userInfo: res1[index]?.value.userInfo, ...item };
//   });
//   return newRes;
// }

async function updateUserJoinedRoom(data: {
  socketId: string;
  client_ip: string;
}) {
  const res = await liveRedisController.getUserJoinedRoom({
    socketId: data.socketId,
  });
  if (res) {
    liveRedisController.setUserJoinedRoom({
      socketId: res.value.socketId,
      joinRoomId: res.value.joinRoomId,
      userInfo: res.value.userInfo,
      created_at: res.created_at,
      client_ip: data.client_ip,
    });
  }
}

export const wsSocket: { io?: Server } = {
  io: undefined,
};

export const connectWebSocket = (server) => {
  if (PROJECT_ENV === PROJECT_ENV_ENUM.beta) {
    console.log(chalkWARN('当前是beta环境，不初始化websocket'));
    return;
  }
  console.log(chalkSUCCESS('初始化websocket成功！'));
  const oneK = 1000;
  const io = new Server(server, {
    maxHttpBufferSize: oneK * 1000 * 100,
  });

  /**
   * 有roomId，发送给roomId的出自己以外的其他人
   * 没有roomId，发送给自己
   */
  function socketEmit<T>({
    socket,
    msgType,
    roomId,
    data,
  }: {
    socket: Socket;
    msgType: WsMsgTypeEnum;
    roomId?: number;
    data?: T;
  }) {
    // console.log('===socketEmit===', roomId, socket.id, msgType);
    if (roomId) {
      socket.to(`${roomId}`).emit(msgType, data);
    } else {
      socket.emit(msgType, data);
    }
  }

  function ioEmit<T>({
    roomId,
    msgType,
    data,
  }: {
    roomId?: number;
    msgType: WsMsgTypeEnum;
    data?: T;
  }) {
    // console.log('===ioEmit===', roomId, msgType);
    if (roomId) {
      io.to(`${roomId}`).emit(msgType, data);
    } else {
      io.emit(msgType, data);
    }
  }

  wsSocket.io = io;

  function prettierInfoLog(data: {
    msg: string;
    socket: Socket;
    roomId?: number;
  }) {
    console.log(
      chalkINFO(
        `${new Date().toLocaleString()},${data.msg},roomId:${
          data.roomId || ''
        },socketId:${data.socket.id},socketIp:${getSocketRealIp(data.socket)}`
      )
    );
  }

  // socket.emit会将消息发送给发件人
  // socket.broadcast.emit会将消息发送给除了发件人以外的所有人
  // io.emit会将消息发送给所有人，包括发件人

  // 每个客户端socket连接时都会触发 connection 事件
  io.on(WsConnectStatusEnum.connection, (socket: Socket) => {
    prettierInfoLog({ msg: 'connection', socket });

    // 收到用户进入房间
    socket.on(WsMsgTypeEnum.join, async (data: WsJoinType) => {
      const roomId = data.data.live_room_id;
      prettierInfoLog({
        msg: '收到用户进入房间',
        socket,
        roomId,
      });
      if (!roomId) {
        console.log(chalkERROR('roomId为空'));
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
      socketEmit<WsJoinType['data']>({
        socket,
        msgType: WsMsgTypeEnum.joined,
        data: {
          socket_id: data.socket_id,
          anchor_info: liveRoomInfo.user_live_room!.user,
          live_room_id: roomId,
          live_room: liveRoomInfo,
          user_info: data.user_info,
        },
      });
      liveRedisController.setUserJoinedRoom({
        socketId: data.socket_id,
        joinRoomId: roomId,
        userInfo: data.user_info,
        client_ip: getSocketRealIp(socket),
      });
      const liveUser = await getRoomAllUser(io, roomId);
      socketEmit<WSGetRoomAllUserType['data']>({
        socket,
        roomId,
        msgType: WsMsgTypeEnum.liveUser,
        data: {
          // @ts-ignore
          liveUser,
        },
      });
      if (liveRoomInfo.type === LiveRoomTypeEnum.system && liveInfo) {
        socketEmit<WsRoomLivingType['data']>({
          socket,
          msgType: WsMsgTypeEnum.roomLiving,
          data: {
            live_room: liveRoomInfo,
            anchor_socket_id: liveInfo.socket_id!,
          },
        });
        liveRedisController.setUserJoinedRoom({
          socketId: socket.id,
          joinRoomId: roomId,
          userInfo: data.user_info,
          client_ip: getSocketRealIp(socket),
        });
      } else if (liveInfo && liveRoomInfo) {
        socketEmit<WsRoomLivingType['data']>({
          socket,
          msgType: WsMsgTypeEnum.roomLiving,
          data: {
            live_room: liveRoomInfo,
            anchor_socket_id: liveInfo.socket_id!,
          },
        });
        liveRedisController.setUserJoinedRoom({
          socketId: socket.id,
          joinRoomId: roomId,
          userInfo: data.user_info,
          client_ip: getSocketRealIp(socket),
        });
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
        },
      });
    });

    // 收到主播开始直播
    socket.on(WsMsgTypeEnum.startLive, async (data: WsStartLiveType) => {
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

      liveRoomService.update({
        id: roomId,
        cover_img: data.data.cover_img,
        name: data.data.name,
        type: data.data.type,
      });
      prettierInfoLog({
        msg: '收到主播开始直播',
        socket,
        roomId,
      });
      if (data.data.type === LiveRoomTypeEnum.user_wertc) {
        await liveService.create({
          live_room_id: Number(roomId),
          user_id: userId,
          socket_id: data.socket_id,
          track_audio: 1,
          track_video: 1,
        });
        socketEmit<WsRoomLivingType['data']>({
          msgType: WsMsgTypeEnum.roomLiving,
          roomId,
          socket,
          data: {
            live_room: userLiveRoomInfo.live_room!,
            anchor_socket_id: data.socket_id,
          },
        });
      } else if (data.data.type === LiveRoomTypeEnum.user_msr) {
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
        if (
          msrMaxDelay < msrDelay * 3 ||
          !Number.isInteger(msrMaxDelay / 1000)
        ) {
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
        const timer = setTimeout(() => {
          startBlobIsExistSchedule({
            roomId,
            msrDelay: data.data.msrDelay,
            msrMaxDelay: data.data.msrMaxDelay,
          });
          clearTimeout(timer);
        }, msrMaxDelay / 2);
        const timer1 = setTimeout(() => {
          mp4PushRtmp({
            txt: txtFile,
            rtmpUrl: userLiveRoomInfo.live_room!.rtmp_url!,
            token: liveRoomInfo!.key!,
          });
          clearTimeout(timer1);
        }, msrMaxDelay);
      } else if (data.data.type === LiveRoomTypeEnum.user_pk) {
        try {
          const pkKey = getRandomString(8);
          await redisController.setExVal({
            prefix: REDIS_PREFIX.livePkKey,
            exp: 60 * 5,
            value: { key: pkKey },
            key: `${roomId}`,
            client_ip: getSocketRealIp(socket),
          });
          socketEmit<WSLivePkKeyType['data']>({
            socket,
            msgType: WsMsgTypeEnum.livePkKey,
            data: {
              live_room_id: roomId,
              key: pkKey,
            },
          });
        } catch (error) {
          console.log(error);
        }
      }
    });

    // 收到用户获取当前在线用户
    socket.on(WsMsgTypeEnum.getLiveUser, async (data: WsGetLiveUserType) => {
      prettierInfoLog({
        msg: '收到用户获取当前在线用户',
        socket,
        roomId: data.data.live_room_id,
      });
      const liveUser = await liveRedisController.getLiveRoomOnlineUser(
        data.data.live_room_id
      );
      // const liveUser = await getRoomAllUser(io, data.data.live_room_id);
      socketEmit<WSGetRoomAllUserType['data']>({
        socket,
        msgType: WsMsgTypeEnum.liveUser,
        data: {
          liveUser,
        },
      });
    });

    // 收到主播断开直播
    socket.on(WsMsgTypeEnum.roomNoLive, async (data: WsRoomNoLiveType) => {
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
      prettierInfoLog({
        msg: '收到主播断开直播',
        socket,
        roomId,
      });
      socketEmit<WsRoomNoLiveType['data']>({
        roomId,
        socket,
        msgType: WsMsgTypeEnum.roomNoLive,
        data: { live_room: userLiveRoomInfo.live_room! },
      });
      if (userLiveRoomInfo.live_room?.type === LiveRoomTypeEnum.user_wertc) {
        liveService.deleteByLiveRoomId(roomId);
      } else if (
        userLiveRoomInfo.live_room?.type === LiveRoomTypeEnum.user_msr
      ) {
        liveService.deleteByLiveRoomId(roomId);
        nodeSchedule.cancelJob(`${SCHEDULE_TYPE.blobIsExist}___${roomId}`);
        console.log('收到主播断开直播，删除直播间的webm目录');
        const roomDir = path.resolve(WEBM_DIR, `roomId_${roomId}`);
        if (fs.existsSync(roomDir)) {
          rimrafSync(roomDir);
        }
      }
    });

    // 收到用户发送消息
    socket.on(WsMsgTypeEnum.message, async (data: WsMessageType) => {
      prettierInfoLog({
        msg: '收到用户发送消息',
        socket,
        roomId: data.data.live_room_id,
      });
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
    });

    // 收到心跳
    socket.on(WsMsgTypeEnum.heartbeat, (data: WsHeartbeatType['data']) => {
      updateUserJoinedRoom({
        socketId: data.socket_id,
        client_ip: getSocketRealIp(socket),
      });
    });

    // 收到主播禁言用户
    socket.on(
      WsMsgTypeEnum.disableSpeaking,
      async (data: WsDisableSpeakingType) => {
        prettierInfoLog({
          msg: '收到主播禁言用户',
          socket,
        });
        try {
          if (!data.user_token) {
            return;
          }
          const { userInfo } = await jwtVerify(data.user_token);
          if (!userInfo?.id) {
            return;
          }
          const auths = await AuthController.common.getUserAuth(userInfo.id);
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
                msgType: WsMsgTypeEnum.disableSpeaking,
                data: {
                  ...data.data,
                  restore_disable_ok: true,
                  request_id: data.request_id,
                },
              });
              // socketEmit<WsDisableSpeakingType['data']>({
              //   socket,
              //   msgType: WsMsgTypeEnum.disableSpeaking,
              //   data: {
              //     ...data.data,
              //     restore_disable_ok: true,
              //     request_id: data.request_id,
              //   },
              // });

              // io.sockets.sockets.forEach((socketItem) => {
              //   if (socketItem.id === data.data.socket_id) {
              //     socketEmit<WsDisableSpeakingType['data']>({
              //       socket: socketItem,
              //       msgType: WsMsgTypeEnum.disableSpeaking,
              //       data: {
              //         ...data.data,
              //         restore_disable_ok: true,
              //         request_id: data.request_id,
              //       },
              //     });
              //   }
              // });
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
                msgType: WsMsgTypeEnum.disableSpeaking,
                data: {
                  ...data.data,
                  disable_expired_at: +new Date() + exp * 1000,
                  is_disable_speaking: true,
                  request_id: data.request_id,
                },
              });
              // io.sockets.sockets.forEach((socketItem) => {
              //   if (socketItem.id === data.data.socket_id) {
              //     socketEmit<WsDisableSpeakingType['data']>({
              //       socket: socketItem,
              //       msgType: WsMsgTypeEnum.disableSpeaking,
              //       data: {
              //         ...data.data,
              //         disable_ok: true,
              //         disable_expired_at: +new Date() + exp * 1000,
              //         request_id: data.request_id,
              //       },
              //     });
              //   }
              // });
            }
          }
        } catch (error) {
          console.log(error);
          console.log(chalkERROR('disableSpeaking错误'));
        }
      }
    );

    // 收到更新加入信息
    socket.on(
      WsMsgTypeEnum.updateJoinInfo,
      async (data: WsUpdateJoinInfoType) => {
        prettierInfoLog({
          msg: '收到更新加入信息',
          socket,
          roomId: data.data.live_room_id,
        });
        const res = await liveRedisController.getUserJoinedRoom({
          socketId: data.socket_id,
        });
        liveRoomService.update({
          id: data.data.live_room_id,
          rtmp_url: data.data.rtmp_url,
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
    );

    // 收到srsOffer
    socket.on(WsMsgTypeEnum.srsOffer, (data: WsOfferType) => {
      prettierInfoLog({
        msg: '收到srsOffer',
        socket,
        roomId: data.data.live_room_id,
      });
      socketEmit<WsOfferType['data']>({
        roomId: data.data.live_room_id,
        socket,
        msgType: WsMsgTypeEnum.srsOffer,
        data: data.data,
      });
    });

    // 收到srsAnswer
    socket.on(WsMsgTypeEnum.srsAnswer, (data: WsAnswerType) => {
      prettierInfoLog({
        msg: '收到srsAnswer',
        socket,
        roomId: data.data.live_room_id,
      });
      socketEmit<WsAnswerType['data']>({
        roomId: data.data.live_room_id,
        socket,
        msgType: WsMsgTypeEnum.srsAnswer,
        data: data.data,
      });
    });

    // 收到srsCandidate
    socket.on(WsMsgTypeEnum.srsCandidate, (data: WsCandidateType) => {
      prettierInfoLog({
        msg: '收到srsCandidate',
        socket,
        roomId: data.data.live_room_id,
      });
      socketEmit<WsCandidateType['data']>({
        socket,
        roomId: data.data.live_room_id,
        msgType: WsMsgTypeEnum.srsCandidate,
        data: data.data,
      });
    });

    // 收到nativeWebRtcOffer
    socket.on(WsMsgTypeEnum.nativeWebRtcOffer, (data: WsOfferType) => {
      prettierInfoLog({
        msg: '收到nativeWebRtcOffer',
        socket,
        roomId: data.data.live_room_id,
      });
      socketEmit<WsOfferType['data']>({
        roomId: data.data.live_room_id,
        socket,
        msgType: WsMsgTypeEnum.nativeWebRtcOffer,
        data: data.data,
      });
    });

    // 收到nativeWebRtcAnswer
    socket.on(WsMsgTypeEnum.nativeWebRtcAnswer, (data: WsAnswerType) => {
      prettierInfoLog({
        msg: '收到nativeWebRtcAnswer',
        socket,
        roomId: data.data.live_room_id,
      });
      socketEmit<WsAnswerType['data']>({
        roomId: data.data.live_room_id,
        socket,
        msgType: WsMsgTypeEnum.nativeWebRtcAnswer,
        data: data.data,
      });
    });

    // 收到nativeWebRtcCandidate
    socket.on(WsMsgTypeEnum.nativeWebRtcCandidate, (data: WsCandidateType) => {
      prettierInfoLog({
        msg: '收到nativeWebRtcCandidate',
        socket,
        roomId: data.data.live_room_id,
      });
      socketEmit<WsCandidateType['data']>({
        socket,
        roomId: data.data.live_room_id,
        msgType: WsMsgTypeEnum.nativeWebRtcCandidate,
        data: data.data,
      });
    });

    // msrBlob
    socket.on(WsMsgTypeEnum.msrBlob, async (data: WsMsrBlobType) => {
      prettierInfoLog({
        msg: '收到msrBlob',
        socket,
        roomId: data.data.live_room_id,
      });
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
      // console.log(data.data);
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
    });

    // 断开连接中
    socket.on(WsConnectStatusEnum.disconnecting, (reason) => {
      prettierInfoLog({
        msg: '===断开连接中===',
        socket,
      });
      console.log(reason);
    });

    // 已断开连接
    socket.on(WsConnectStatusEnum.disconnect, async (reason) => {
      prettierInfoLog({
        msg: '===已断开连接===',
        socket,
      });
      console.log(reason);
      try {
        const res1 = await liveRedisController.getUserJoinedRoom({
          socketId: socket.id,
        });
        if (res1) {
          const { joinRoomId, userInfo } = res1.value;
          const liveUser = await getRoomAllUser(io, joinRoomId);
          ioEmit<WsLeavedType['data']>({
            roomId: joinRoomId,
            msgType: WsMsgTypeEnum.leaved,
            data: {
              socket_id: socket.id,
              user_info: userInfo,
            },
          });
          ioEmit<WSGetRoomAllUserType['data']>({
            roomId: joinRoomId,
            msgType: WsMsgTypeEnum.liveUser,
            data: {
              // @ts-ignore
              liveUser,
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
            const roomId = userLiveRoomInfo.live_room_id!;
            if (
              userLiveRoomInfo.live_room?.type === LiveRoomTypeEnum.user_wertc
            ) {
              liveService.deleteByLiveRoomIdAndSocketId({
                live_room_id: roomId,
                socket_id: socket.id,
              });
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    });
  });
};
