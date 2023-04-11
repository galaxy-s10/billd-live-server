import { Server, Socket } from 'socket.io';

import { chalkINFO } from '@/utils/chalkTip';

import { WsConnectStatusEnum, WsMsgTypeEnum } from './constant';

const adminStatus = { socketId: '', live: false };

interface IOffer {
  socketId: string;
  roomId: string;
  sdp: any;
}

async function getAllLiveUser(io) {
  const allSocketsMap = await io.fetchSockets();
  return Object.keys(allSocketsMap).map((item) => {
    return {
      id: allSocketsMap[item].id,
      rooms: [...allSocketsMap[item].rooms.values()],
    };
  });
}

export const connectWebSocket = (server) => {
  console.log(chalkINFO('当前非beta环境，初始化websocket'));

  const io = new Server(server);

  // socket.emit会将消息发送给发件人
  // socket.broadcast.emit会将消息发送给除了发件人以外的所有人
  // io.emit会将消息发送给所有人，包括发件人

  io.on(WsConnectStatusEnum.connection, async (socket: Socket) => {
    console.log(new Date().toLocaleString(), 'connection', socket.id);
    // const currLiveUser = await getAllLiveUser(io);
    // io.emit(WsMsgTypeEnum.liveUser, currLiveUser);

    // 收到用户进入房间
    socket.on(
      WsMsgTypeEnum.join,
      async (data: { roomId: string; data: any; isAdmin?: boolean }) => {
        socket.join(data.roomId);
        console.log(
          new Date().toLocaleString(),
          socket.id,
          '收到用户进入房间',
          data
        );
        const liveUser = await getAllLiveUser(io);
        console.log('当前所有在线用户', liveUser);
        socket.emit(WsMsgTypeEnum.joined, data);
        if (data.isAdmin) {
          adminStatus.socketId = socket.id;
          adminStatus.live = true;
        } else if (adminStatus.live) {
          // socket.emit(WsMsgTypeEnum.adminIn, data);
        }
        socket.to(data.roomId).emit(WsMsgTypeEnum.otherJoin, data);

        // io.emit(WsMsgTypeEnum.liveUser, liveUser);
      }
    );

    // 收到用户退出房间
    socket.on(WsMsgTypeEnum.leave, (data) => {
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '收到用户退出房间',
        data
      );
      socket.emit(WsMsgTypeEnum.leaved, {});
    });

    // 收到用户发送消息
    socket.on(WsMsgTypeEnum.message, (data) => {
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '收到用户发送消息',
        data
      );
    });

    // 收到管理员开始直播
    socket.on(WsMsgTypeEnum.adminIn, (data) => {
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '收到管理员开始直播',
        data
      );
      socket.to(data.roomId).emit(WsMsgTypeEnum.adminIn, data);
    });

    // 收到offer
    socket.on(WsMsgTypeEnum.offer, (data: IOffer) => {
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '收到offer',
        data.roomId,
        data.socketId
      );
      socket.to(data.roomId).emit(WsMsgTypeEnum.offer, data);
    });

    // 收到answer
    socket.on(WsMsgTypeEnum.answer, (data) => {
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '收到answer',
        data.roomId,
        data.socketId
      );
      socket.to(data.roomId).emit(WsMsgTypeEnum.answer, data);
    });

    // 收到candidate
    socket.on(WsMsgTypeEnum.candidate, (data) => {
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '收到candidate',
        data.roomId,
        data.socketId
      );
      socket.to(data.roomId).emit(WsMsgTypeEnum.candidate, data);
    });

    // 断开连接中
    socket.on(WsConnectStatusEnum.disconnecting, async (reason) => {
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '===断开连接中===',
        reason
      );
      const liveUser = await getAllLiveUser(io);
      console.log('当前所有在线用户', liveUser);
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '===断开连接中===',
        reason
      );
    });

    // 已断开连接
    socket.on(WsConnectStatusEnum.disconnect, async (reason) => {
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '===已断开连接===',
        reason
      );
      const liveUser = await getAllLiveUser(io);
      console.log('当前所有在线用户', liveUser);
      io.emit(WsMsgTypeEnum.liveUser, liveUser);
      if (socket.id === adminStatus.socketId) {
        adminStatus.socketId = '';
        adminStatus.live = false;
      }
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '===已断开连接===',
        reason
      );
    });
  });
};
