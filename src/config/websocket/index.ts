import fs from 'fs';
import path from 'path';

import { Server, Socket } from 'socket.io';

import { pubClient } from '@/config/redis/pub';
import { REDIS_CONFIG } from '@/config/secret';
import {
  WsConnectStatusEnum,
  WsMsgTypeEnum,
} from '@/config/websocket/constant';
import liveRedisController from '@/config/websocket/live-redis.controller';
import { PROJECT_ENV, PROJECT_ENV_ENUM, REDIS_PREFIX } from '@/constant';
import liveController from '@/controller/live.controller';
import orderController from '@/controller/order.controller';
import { IUser } from '@/interface';
import liveService from '@/service/live.service';
import { chalkINFO, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';

interface IOffer {
  socketId: string;
  roomId: number;
  sdp: any;
}

async function getAllLiveUser(io) {
  const allSocketsMap = await io.fetchSockets();
  const res = Object.keys(allSocketsMap).map((item) => {
    return {
      id: allSocketsMap[item].id,
      rooms: [...allSocketsMap[item].rooms.values()],
    };
  });
  const promise1: Promise<{
    value: {
      roomId: number;
      socketId: string;
      userInfo: IUser;
    };
    created_at?: number;
    expired_at?: number;
  } | null>[] = [];
  res.forEach((item) => {
    promise1.push(
      liveRedisController.getUserJoinedRoom({
        socketId: item.id,
      })
    );
  });
  const res1 = await Promise.all(promise1);
  const newRes = res.map((item, index) => {
    return { userInfo: res1[index]?.value.userInfo, ...item };
  });
  return newRes;
}

async function updateUserJoinedRoom(data: { socketId: string }) {
  const res = await liveRedisController.getUserJoinedRoom({
    socketId: data.socketId,
  });
  if (res) {
    liveRedisController.setUserJoinedRoom({
      socketId: res.value.socketId,
      roomId: res.value.roomId,
      userInfo: res.value.userInfo,
      created_at: res.created_at,
    });
  }
}
async function updateRoomIsLiveing(liveId: number) {
  try {
    const res = await liveRedisController.getUserLiveing({
      liveId,
    });
    if (res) {
      const obj = JSON.parse(res);
      await liveRedisController.setUserLiveing({
        liveId,
        socketId: obj.value.socketId,
        roomId: obj.value.roomId,
        userInfo: obj.value.userInfo,
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export const connectWebSocket = (server) => {
  if (PROJECT_ENV === PROJECT_ENV_ENUM.beta) {
    console.log(chalkWARN('当前是beta环境，不初始化websocket'));
    return;
  }
  console.log(chalkSUCCESS('初始化websocket成功！'));

  const io = new Server(server);

  pubClient.subscribe(
    `__keyevent@${REDIS_CONFIG.database}__:expired`,
    (redisKey, subscribeName) => {
      console.log('过期key监听', redisKey, subscribeName);
      // 订单过期
      if (redisKey.indexOf(REDIS_PREFIX.order) === 0) {
        const out_trade_no = redisKey.replace(`${REDIS_PREFIX.order}-`, '');
        orderController.commonGetPayStatus(out_trade_no);
      }
      // 房间不直播了
      if (redisKey.indexOf(REDIS_PREFIX.roomIsLiveing) === 0) {
        const liveId = redisKey.replace(`${REDIS_PREFIX.roomIsLiveing}-`, '');
        liveController.common.delete(+liveId);
      }
    }
  );

  function prettierInfoLog(data: {
    msg: string;
    socketId?: string;
    roomId?: number;
  }) {
    console.log(
      chalkINFO(
        `${new Date().toLocaleString()},${
          data.msg
        },socketId:${data.socketId!},roomId:${data.roomId!}`
      )
    );
  }

  // socket.emit会将消息发送给发件人
  // socket.broadcast.emit会将消息发送给除了发件人以外的所有人
  // io.emit会将消息发送给所有人，包括发件人

  io.on(WsConnectStatusEnum.connection, (socket: Socket) => {
    prettierInfoLog({ msg: 'connection' });

    // 收到用户进入房间
    socket.on(
      WsMsgTypeEnum.join,
      async (data: {
        roomId: number;
        socketId: string;
        data: {
          roomName: string;
          coverImg: string;
          userInfo?: IUser;
          srs?: { streamurl: string; flvurl: string };
          track: { audio: boolean; video: boolean };
          liveId?: number;
        };
        isAdmin: boolean;
      }) => {
        prettierInfoLog({
          msg: '收到用户进入房间',
          socketId: socket.id,
          roomId: data.roomId,
        });
        socket.join(`${data.roomId}`);
        if (data.isAdmin) {
          let liveId;
          try {
            const res = await liveService.create({
              live_room_id: data.roomId,
              user_id: data.data.userInfo?.id,
              socketId: socket.id,
              system: 2,
              track_audio: data.data.track.audio,
              track_video: data.data.track.video,
              coverImg: data.data.coverImg,
              streamurl: data.data.srs?.streamurl,
              flvurl: data.data.srs?.flvurl,
            });
            liveId = res.id;
            liveRedisController.setUserLiveing({
              liveId,
              socketId: socket.id,
              roomId: data.roomId,
              userInfo: data.data.userInfo,
            });
          } catch (error) {
            console.log(error);
          }
          const newdata = { ...data };
          newdata.data.liveId = liveId;
          socket.emit(WsMsgTypeEnum.joined, newdata);
        } else {
          const res = await liveService.findByRoomId(data.roomId);
          if (!res) {
            socket.emit(WsMsgTypeEnum.roomNoLive, { roomId: data.roomId });
          } else {
            liveRedisController.setUserJoinedRoom({
              socketId: socket.id,
              roomId: data.roomId,
              userInfo: data.data.userInfo,
            });
            socket.emit(WsMsgTypeEnum.joined, { data: res.get() || {} });
            socket.emit(WsMsgTypeEnum.roomLiveing, data);
            socket.to(`${data.roomId}`).emit(WsMsgTypeEnum.otherJoin, {
              data: res
                ? { ...res?.get(), socketId: socket.id }
                : { socketId: socket.id },
            });
            const liveUser = await getAllLiveUser(io);
            socket.to(`${data.roomId}`).emit(WsMsgTypeEnum.liveUser, liveUser);
          }
        }
      }
    );

    // 收到用户获取当前在线用户
    socket.on(WsMsgTypeEnum.getLiveUser, async (data) => {
      prettierInfoLog({
        msg: '收到用户获取当前在线用户',
        socketId: socket.id,
        roomId: data.roomId,
      });
      // socket.emit(WsMsgTypeEnum.getLiveUser, { socketId: socket.id });
      const liveUser = await getAllLiveUser(io);
      socket.emit(WsMsgTypeEnum.liveUser, liveUser);
    });

    // 收到用户离开房间
    socket.on(WsMsgTypeEnum.leave, async (data) => {
      prettierInfoLog({
        msg: '收到用户离开房间',
        socketId: socket.id,
        roomId: data.roomId,
      });
      socket.emit(WsMsgTypeEnum.leaved, { socketId: socket.id });
      const liveUser = await getAllLiveUser(io);
      socket.to(data.roomId).emit(WsMsgTypeEnum.liveUser, liveUser);
    });

    // 收到用户发blob
    socket.on(
      WsMsgTypeEnum.sendBlob,
      (data: { data: { blob: any; timestamp: number } }) => {
        console.log(
          new Date().toLocaleString(),
          socket.id,
          '收到用户发blob',
          data
        );
        fs.writeFileSync(
          path.resolve(__dirname, `./chunk/${data.data.timestamp}.webm`),
          data.data.blob
        );
        // const blob = new Blob(data.data.blob);
      }
    );

    // 收到用户发送消息
    socket.on(WsMsgTypeEnum.message, (data) => {
      prettierInfoLog({
        msg: '收到用户发送消息',
        socketId: socket.id,
        roomId: data.roomId,
      });
      socket.to(data.roomId).emit(WsMsgTypeEnum.message, data);
    });

    // 收到管理员开始直播
    socket.on(WsMsgTypeEnum.roomLiveing, (data) => {
      prettierInfoLog({
        msg: '收到管理员开始直播',
        socketId: socket.id,
        roomId: data.roomId,
      });
      socket.to(data.roomId).emit(WsMsgTypeEnum.roomLiveing, data);
    });

    // 收到管理员不在直播
    socket.on(WsMsgTypeEnum.roomNoLive, (data) => {
      prettierInfoLog({
        msg: '收到管理员不在直播',
        socketId: socket.id,
        roomId: data.roomId,
      });
    });

    // 收到心跳
    socket.on(
      WsMsgTypeEnum.heartbeat,
      (data: {
        roomId: number;
        socketId: string;
        data?: {
          liveId: number;
        };
        isAdmin: boolean;
      }) => {
        prettierInfoLog({
          msg: '收到心跳',
          socketId: socket.id,
          roomId: data.roomId,
        });
        updateUserJoinedRoom({ socketId: data.socketId });
        if (data.data?.liveId) {
          updateRoomIsLiveing(data.data.liveId);
        }
      }
    );

    // 收到更新加入信息
    socket.on(
      WsMsgTypeEnum.updateJoinInfo,
      async (data: {
        roomId: number;
        socketId: string;
        data: {
          roomName: string;
          coverImg: string;
          userInfo: IUser;
        };
      }) => {
        prettierInfoLog({
          msg: '收到更新加入信息',
          socketId: socket.id,
          roomId: data.roomId,
        });
        const res = await liveRedisController.getUserJoinedRoom({
          socketId: data.socketId,
        });
        if (res) {
          liveRedisController.setUserJoinedRoom({
            socketId: data.socketId,
            roomId: data.roomId,
            userInfo: data.data.userInfo,
          });
        }
      }
    );

    // 收到offer
    socket.on(WsMsgTypeEnum.offer, (data: IOffer) => {
      prettierInfoLog({
        msg: '收到offer',
        socketId: socket.id,
        roomId: data.roomId,
      });
      socket.to(`${data.roomId}`).emit(WsMsgTypeEnum.offer, data);
    });

    // 收到answer
    socket.on(WsMsgTypeEnum.answer, (data) => {
      prettierInfoLog({
        msg: '收到answer',
        socketId: socket.id,
        roomId: data.roomId,
      });
      socket.to(data.roomId).emit(WsMsgTypeEnum.answer, data);
    });

    // 收到candidate
    socket.on(WsMsgTypeEnum.candidate, (data) => {
      prettierInfoLog({
        msg: '收到candidate',
        socketId: socket.id,
        roomId: data.roomId,
      });
      socket.to(data.roomId).emit(WsMsgTypeEnum.candidate, data);
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
      const res = await liveService.findBySocketId(socket.id);
      if (res.count) {
        // 是管理员断开连接
        const roomId = `${res.rows[0].live_room_id!}`;
        socket.to(roomId).emit(WsMsgTypeEnum.roomNoLive);
        liveService.deleteBySocketId(res.rows[0].socketId || '-1');
      } else {
        // 不是管理员断开连接
        const res1 = await liveRedisController.getUserJoinedRoom({
          socketId: socket.id,
        });
        if (res1) {
          try {
            const { roomId, userInfo } = res1.value;
            const liveUser = await getAllLiveUser(io);
            socket.to(`${roomId}`).emit(WsMsgTypeEnum.liveUser, liveUser);
            socket.to(`${roomId}`).emit(WsMsgTypeEnum.leaved, {
              socketId: socket.id,
              data: { userInfo },
            });
            liveRedisController.delUserJoinedRoom({ socketId: socket.id });
          } catch (error) {
            console.log(error);
          }
        }
      }
    });
  });
};
