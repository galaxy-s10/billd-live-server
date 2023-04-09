import { Server, Socket } from 'socket.io';

import { chalkINFO } from '@/utils/chalkTip';

import { wsConnectStatus, wsMsgType } from './constant';

const userMax = 3;
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

  io.on(wsConnectStatus.connection, async (socket: Socket) => {
    console.log(new Date().toLocaleString(), 'connection', socket.id);
    const currLiveUser = await getAllLiveUser(io);
    io.emit(wsMsgType.liveUser, currLiveUser);

    // 收到用户进入房间
    socket.on(wsMsgType.join, async (data: { roomId: string }) => {
      socket.join(data.roomId);
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '收到用户进入房间',
        data
      );
      const liveUser = await getAllLiveUser(io);
      console.log('当前所有在线用户', liveUser);
      const { size } = socket.rooms;
      if (size < userMax) {
        socket.emit(wsMsgType.joined, {
          size: liveUser.length,
          liveUser,
        });
        if (size > 1) {
          socket.to(data.roomId).emit(wsMsgType.otherJoin, {
            roomId: data.roomId,
            socketId: socket.id,
          });
          io.emit(wsMsgType.liveUser, liveUser);
        }
      } else {
        io.emit(wsMsgType.full);
      }
    });

    // 收到用户退出房间
    socket.on(wsMsgType.leave, (data) => {
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '收到用户退出房间',
        data
      );
      socket.emit(wsMsgType.leaved, {});
    });

    // 收到用户发送消息
    socket.on(wsMsgType.message, (data) => {
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '收到用户发送消息',
        data
      );
    });

    // 收到offer
    socket.on(wsMsgType.offer, (data: IOffer) => {
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '收到offer',
        data.roomId,
        data.socketId
      );
      socket.to(data.roomId).emit(wsMsgType.offer, data);
    });

    // 收到answer
    socket.on(wsMsgType.answer, (data) => {
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '收到answer',
        data.roomId,
        data.socketId
      );
      socket.to(data.roomId).emit(wsMsgType.answer, data);
    });

    // 收到candidate
    socket.on(wsMsgType.candidate, (data) => {
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '收到candidate',
        data.roomId,
        data.socketId
      );
      socket.to(data.roomId).emit(wsMsgType.candidate, data);
    });

    // 断开连接中
    socket.on(wsConnectStatus.disconnecting, async (reason) => {
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
    socket.on(wsConnectStatus.disconnect, async (reason) => {
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '===已断开连接===',
        reason
      );
      const liveUser = await getAllLiveUser(io);
      console.log('当前所有在线用户', liveUser);
      io.emit(wsMsgType.liveUser, liveUser);
      console.log(
        new Date().toLocaleString(),
        socket.id,
        '===已断开连接===',
        reason
      );
    });
  });
};
