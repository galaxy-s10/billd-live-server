import { Server, Socket } from 'socket.io';

import { chalkINFO } from '@/utils/chalkTip';

import { wsConnectStatus, wsMsgType } from './constant';

const userMax = 3;
interface IOffer {
  socketId: string;
  roomId: string;
  sdp: any;
}
export const connectWebSocket = (server) => {
  console.log(chalkINFO('当前非beta环境，初始化websocket'));

  const io = new Server(server);

  // socket.emit会将消息发送给发件人
  // socket.broadcast.emit会将消息发送给除了发件人以外的所有人
  // io.emit会将消息发送给所有人，包括发件人

  io.on(wsConnectStatus.connection, (socket: Socket) => {
    console.log(new Date().toLocaleString(), 'connection', socket.id);
    console.log('当前的全局房间列表', socket.rooms);

    // 用户进入房间
    socket.on(wsMsgType.join, (data: { roomId: string }) => {
      socket.join(data.roomId);
      console.log(new Date().toLocaleString(), socket.id, '用户进入房间', data);
      const { size } = socket.rooms;
      console.log('当前的房间列表', socket.rooms);
      console.log('当前的房间size', size);
      if (size < userMax) {
        socket.emit(wsMsgType.joined);
        if (size > 1) {
          socket.to(data.roomId).emit(wsMsgType.otherJoin, {
            roomId: data.roomId,
            socketId: socket.id,
          });
        }
      } else {
        io.emit(wsMsgType.full);
      }
    });

    // 用户退出房间
    socket.on(wsMsgType.leave, (data) => {
      console.log(new Date().toLocaleString(), socket.id, '用户退出房间', data);
      socket.emit(wsMsgType.leaved, {});
    });

    // 用户发送消息
    socket.on(wsMsgType.message, (data) => {
      console.log(new Date().toLocaleString(), socket.id, '用户发送消息', data);
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
    socket.on(wsConnectStatus.disconnecting, (reason) => {
      console.log(new Date().toLocaleString(), socket.id, '断开连接中', reason);
    });

    // 已断开连接
    socket.on(wsConnectStatus.disconnect, (reason) => {
      console.log(new Date().toLocaleString(), socket.id, '已断开连接', reason);
    });
  });
};
