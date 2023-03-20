import { Server, Socket } from 'socket.io';

import { chalkINFO } from '@/utils/chalkTip';

import { wsConnectStatus, wsMsgType } from './constant';

export const connectWebSocket = (server) => {
  console.log(chalkINFO('当前非beta环境，初始化websocket'));

  const io = new Server(server);

  io.on(wsConnectStatus.connection, (socket: Socket) => {
    console.log(new Date().toLocaleString(), 'connection');

    // 用户进入房间
    socket.on(wsMsgType.userInRoom, (data) => {
      console.log(new Date().toLocaleString(), '用户进入房间', data);
    });

    // 用户退出房间
    socket.on(wsMsgType.userOutRoom, (data) => {
      console.log(new Date().toLocaleString(), '用户退出房间', data);
    });

    // 用户发送消息
    socket.on(wsMsgType.userSendMsg, (data) => {
      console.log(new Date().toLocaleString(), '用户发送消息', data);
    });

    // 断开连接中
    socket.on(wsConnectStatus.disconnecting, (reason) => {
      console.log(new Date().toLocaleString(), '断开连接中', reason);
    });

    // 已断开连接
    socket.on(wsConnectStatus.disconnect, (reason) => {
      console.log(new Date().toLocaleString(), '已断开连接', reason);
    });
  });
};
