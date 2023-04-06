import { chalkINFO } from '@/utils/chalkTip';

const userMax = 3;

export const connectWebSocket = (server) => {
  console.log(chalkINFO('当前非beta环境，初始化websocket'));

  // const io = new Server(server);

  // socket.emit会将消息发送给发件人
  // socket.broadcast.emit会将消息发送给除了发件人以外的所有人
  // io.emit会将消息发送给所有人，包括发件人

  // io.on(wsConnectStatus.connection, (socket: Socket) => {
  //   console.log(new Date().toLocaleString(), 'connection', socket.id);
  //   console.log('当前的全局房间列表', socket.rooms);

  //   // 用户进入房间
  //   socket.on(wsMsgType.join, (data: { roomId: string }) => {
  //     socket.join(data.roomId);
  //     console.log(new Date().toLocaleString(), socket.id, '用户进入房间', data);
  //     const { size } = socket.rooms;
  //     console.log('当前的房间列表', socket.rooms);
  //     console.log('当前的房间size', size);
  //     if (size < userMax) {
  //       socket.emit(wsMsgType.joined);
  //       if (size > 1) {
  //         socket.to(data.roomId).emit(wsMsgType.otherJoin, {
  //           roomId: data.roomId,
  //           socketId: socket.id,
  //         });
  //       }
  //     } else {
  //       io.emit(wsMsgType.full);
  //     }
  //   });

  //   // 用户退出房间
  //   socket.on(wsMsgType.leave, (data) => {
  //     console.log(new Date().toLocaleString(), socket.id, '用户退出房间', data);
  //   });

  //   // 用户发送消息
  //   socket.on(wsMsgType.message, (data) => {
  //     console.log(new Date().toLocaleString(), socket.id, '用户发送消息', data);
  //   });

  //   // 断开连接中
  //   socket.on(wsConnectStatus.disconnecting, (reason) => {
  //     console.log(new Date().toLocaleString(), socket.id, '断开连接中', reason);
  //   });

  //   // 已断开连接
  //   socket.on(wsConnectStatus.disconnect, (reason) => {
  //     console.log(new Date().toLocaleString(), socket.id, '已断开连接', reason);
  //   });
  // });
};
