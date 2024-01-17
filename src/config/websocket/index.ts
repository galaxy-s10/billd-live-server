import { exec } from 'child_process';
import fs from 'fs';

import { rimrafSync } from 'rimraf';
import { Server, Socket } from 'socket.io';

import { jwtVerify } from '@/app/auth/authJwt';
import liveRedisController from '@/config/websocket/live-redis.controller';
import { DEFAULT_AUTH_INFO, PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import AuthController from '@/controller/auth.controller';
import { LiveRoomTypeEnum } from '@/interface';
import {
  WSGetRoomAllUserType,
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
} from '@/interface-ws';
import liveService from '@/service/live.service';
import liveRoomService from '@/service/liveRoom.service';
import userLiveRoomService from '@/service/userLiveRoom.service';
import { resolveApp } from '@/utils';
import {
  chalkERROR,
  chalkINFO,
  chalkSUCCESS,
  chalkWARN,
} from '@/utils/chalkTip';
import { mp4PushRtmp, webmToMp4 } from '@/utils/process';

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

  function socketEmit<T>({
    socket,
    roomId,
    msgType,
    data,
  }: {
    socket: Socket;
    roomId?: number;
    msgType: WsMsgTypeEnum;
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
    socketId?: string;
    roomId?: number;
    ip?: string;
  }) {
    console.log(
      chalkINFO(
        `${new Date().toLocaleString()},${
          data.msg
        },socketId:${data.socketId!},roomId:${data.roomId!},ip:${data.ip!}`
      )
    );
  }

  // socket.emit会将消息发送给发件人
  // socket.broadcast.emit会将消息发送给除了发件人以外的所有人
  // io.emit会将消息发送给所有人，包括发件人

  // 每个客户端socket连接时都会触发 connection 事件
  io.on(WsConnectStatusEnum.connection, (socket: Socket) => {
    prettierInfoLog({ msg: 'connection', ip: socket.handshake.address });

    // 收到用户进入房间
    socket.on(WsMsgTypeEnum.join, async (data: WsJoinType) => {
      const roomId = data.data.live_room.id;
      prettierInfoLog({
        msg: '收到用户进入房间',
        socketId: socket.id,
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
          live_room: liveRoomInfo,
          user_info: data.user_info,
        },
      });
      liveRedisController.setUserJoinedRoom({
        socketId: data.socket_id,
        joinRoomId: data.data.live_room.id!,
        userInfo: data.user_info,
        client_ip: socket.handshake.address,
      });
      const liveUser = await getRoomAllUser(io, roomId);
      socketEmit<WSGetRoomAllUserType['data']>({
        socket,
        roomId,
        msgType: WsMsgTypeEnum.liveUser,
        data: {
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
          client_ip: socket.handshake.address,
        });
      } else if (!liveInfo) {
        socketEmit<WsRoomNoLiveType['data']>({
          socket,
          msgType: WsMsgTypeEnum.roomNoLive,
          data: {
            live_room: liveRoomInfo,
          },
        });
      } else {
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
          client_ip: socket.handshake.address,
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
        socketId: socket.id,
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
        const roomDir = resolveApp(`/src/webm/roomId_${roomId}`);
        const txtFile = `${roomDir}/list.txt`;
        const fileDir = `${roomDir}/file`;
        console.log('删除roomDir111');
        rimrafSync(roomDir);
        let str = '';
        const allTime = 60 * 60 * 24; // 24小时对应的秒数
        for (let i = 1; i < allTime / (data.data.chunkDelay / 1000); i += 1) {
          str += `${i !== 1 ? '\n' : ''}file '${fileDir}/${i}.mp4'`;
          // str += `${i !== 1 ? '\n' : ''}file 'file/${i}.mp4'`;
        }
        if (!fs.existsSync(roomDir)) {
          fs.mkdirSync(roomDir);
        }
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir);
        }
        fs.writeFileSync(txtFile, str);
        setTimeout(() => {
          mp4PushRtmp({
            txt: txtFile,
            rtmpUrl: userLiveRoomInfo.live_room!.rtmp_url!,
            token: liveRoomInfo!.key!,
          });
        }, 1000 * 10);
      }
    });

    // 收到用户获取当前在线用户
    socket.on(WsMsgTypeEnum.getLiveUser, async (data: WsGetLiveUserType) => {
      prettierInfoLog({
        msg: '收到用户获取当前在线用户',
        socketId: socket.id,
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
      const rtmpUrl = userLiveRoomInfo.live_room!.rtmp_url!;
      prettierInfoLog({
        msg: '收到主播断开直播',
        socketId: socket.id,
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
        const cmd = `ps aux | grep ${rtmpUrl} | grep -v grep | awk '{print $2}'`;
        exec(cmd, (err, stdout, stderr) => {
          console.log(err, stdout, stderr);
        });
        const roomDir = resolveApp(`/src/webm/roomId_${roomId}`);
        console.log('删除roomDir222');
        rimrafSync(roomDir);
      }
    });

    // 收到用户发送消息
    socket.on(WsMsgTypeEnum.message, async (data: WsMessageType) => {
      prettierInfoLog({
        msg: '收到用户发送消息',
        socketId: socket.id,
        roomId: data.data.live_room_id,
      });
      const res = await liveRedisController.getDisableSpeaking({
        liveRoomId: data.data.live_room_id,
        userId: data.user_info?.id || -1,
      });
      if (!res) {
        socketEmit<any>({
          socket,
          roomId: data.data.live_room_id,
          msgType: WsMsgTypeEnum.message,
          data,
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
      // prettierInfoLog({
      //   msg: '收到心跳',
      //   socketId: socket.id,
      // });
      updateUserJoinedRoom({
        socketId: data.socket_id,
        client_ip: socket.handshake.address,
      });
    });

    // 收到主播禁言用户
    socket.on(
      WsMsgTypeEnum.disableSpeaking,
      async (data: WsDisableSpeakingType) => {
        prettierInfoLog({
          msg: '收到主播禁言用户',
          socketId: socket.id,
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
                client_ip: socket.handshake.address,
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
          socketId: socket.id,
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
            client_ip: socket.handshake.address,
          });
        }
      }
    );

    // 收到offer
    socket.on(WsMsgTypeEnum.offer, (data: WsOfferType) => {
      prettierInfoLog({
        msg: '收到offer',
        socketId: socket.id,
        roomId: data.data.live_room_id,
      });
      socketEmit<WsOfferType['data']>({
        roomId: data.data.live_room_id,
        socket,
        msgType: WsMsgTypeEnum.offer,
        data: data.data,
      });
    });

    // 收到nativeWebRtcOffer
    socket.on(WsMsgTypeEnum.nativeWebRtcOffer, (data: WsOfferType) => {
      prettierInfoLog({
        msg: '收到nativeWebRtcOffer',
        socketId: socket.id,
        roomId: data.data.live_room_id,
      });
      socketEmit<WsOfferType['data']>({
        roomId: data.data.live_room_id,
        socket,
        msgType: WsMsgTypeEnum.nativeWebRtcOffer,
        data: data.data,
      });
    });

    // 收到answer
    socket.on(WsMsgTypeEnum.answer, (data: WsAnswerType) => {
      prettierInfoLog({
        msg: '收到answer',
        socketId: socket.id,
        roomId: data.data.live_room_id,
      });
      socketEmit<WsAnswerType['data']>({
        roomId: data.data.live_room_id,
        socket,
        msgType: WsMsgTypeEnum.answer,
        data: data.data,
      });
    });

    // 收到nativeWebRtcAnswer
    socket.on(WsMsgTypeEnum.nativeWebRtcAnswer, (data: WsAnswerType) => {
      prettierInfoLog({
        msg: '收到nativeWebRtcAnswer',
        socketId: socket.id,
        roomId: data.data.live_room_id,
      });
      socketEmit<WsAnswerType['data']>({
        roomId: data.data.live_room_id,
        socket,
        msgType: WsMsgTypeEnum.nativeWebRtcAnswer,
        data: data.data,
      });
    });

    // 收到candidate
    socket.on(WsMsgTypeEnum.candidate, (data: WsCandidateType) => {
      prettierInfoLog({
        msg: '收到candidate',
        socketId: socket.id,
        roomId: data.data.live_room_id,
      });
      socketEmit<WsCandidateType['data']>({
        socket,
        roomId: data.data.live_room_id,
        msgType: WsMsgTypeEnum.candidate,
        data: data.data,
      });
    });

    // 收到nativeWebRtcCandidate
    socket.on(WsMsgTypeEnum.nativeWebRtcCandidate, (data: WsCandidateType) => {
      prettierInfoLog({
        msg: '收到nativeWebRtcCandidate',
        socketId: socket.id,
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
        socketId: socket.id,
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
      const roomId = userLiveRoomInfo.live_room_id!;
      const roomDir = resolveApp(`/src/webm/roomId_${roomId}`);
      const fileDir = `${roomDir}/file`;
      const blobFile = `${fileDir}/${data.data.blob_id}.webm`;

      if (!fs.existsSync(roomDir)) {
        fs.mkdirSync(roomDir);
      }
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir);
      }
      fs.writeFileSync(blobFile, data.data.blob);
      const mp4File = blobFile.replace('.webm', '.mp4');
      webmToMp4({
        input: blobFile,
        output: mp4File,
      });
      setTimeout(() => {
        rimrafSync([blobFile, mp4File]);
      }, 1000 * 60);
    });

    // 断开连接中
    socket.on(WsConnectStatusEnum.disconnecting, (reason) => {
      prettierInfoLog({
        msg: '===断开连接中===',
        socketId: socket.id,
      });
      console.log(reason);
    });

    // 已断开连接
    socket.on(WsConnectStatusEnum.disconnect, async (reason) => {
      prettierInfoLog({
        msg: '===已断开连接===',
        socketId: socket.id,
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

          // const res2 = await liveRedisController.getAnchorLiving({
          //   liveRoomId: joinRoomId,
          // });
          // if (res2) {
          //   if (
          //     joinRoomId === res2.value.liveRoomId &&
          //     socket.id === res2.value.socketId
          //   ) {
          //     const [liveRoomInfo] = await Promise.all([
          //       liveRoomService.find(joinRoomId),
          //     ]);
          //     ioEmit<WsRoomNoLiveType['data']>({
          //       roomId: joinRoomId,
          //       msgType: WsMsgTypeEnum.roomNoLive,
          //       data: {
          //         live_room: liveRoomInfo!,
          //       },
          //     });
          //     // 不能只在on_unpublish回调里面删除live记录，因为on_unpublish会延迟几秒
          //     // liveController.common.deleteByLiveRoomId(joinRoomId);
          //     // liveRedisController.delAnchorLiving({
          //     //   liveRoomId: joinRoomId,
          //     // });
          //   }
          // }
        }
      } catch (error) {
        console.log(error);
      }
    });
  });
};
