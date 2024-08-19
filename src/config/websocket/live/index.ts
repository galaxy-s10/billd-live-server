import { Server, Socket } from 'socket.io';

import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import { WsConnectStatusEnum } from '@/types/websocket';
import { chalkINFO, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';

export const wsSocket: { io?: Server } = {
  io: undefined,
};

export function getSocketRealIp(socket: Socket) {
  if (!socket) {
    return '-1';
  }
  const realIp = socket.handshake.headers['x-real-ip'] as string;
  return realIp || '-1';
}

function prettierInfoLog(data: {
  msg: string;
  socket: Socket;
  roomId?: number;
}) {
  console.log(
    chalkINFO(
      `${data.msg},roomId:${data.roomId || ''},socketId:${
        data.socket.id
      },socketIp:${getSocketRealIp(data.socket)}`
    )
  );
}

export const connectLiveWebSocket = (server) => {
  if (PROJECT_ENV === PROJECT_ENV_ENUM.beta) {
    console.log(chalkWARN('当前是beta环境，不初始化websocket'));
    return;
  }
  console.log(chalkSUCCESS('初始化websocket成功！'));
  const oneK = 1000;
  const io = new Server(server, {
    maxHttpBufferSize: oneK * 1000 * 100,
    // parser: customParser,
  });

  wsSocket.io = io;

  // socket.emit会将消息发送给发件人
  // socket.broadcast.emit会将消息发送给除了发件人以外的所有人
  // io.emit会将消息发送给所有人，包括发件人

  // 每个客户端socket连接时都会触发 connection 事件
  io.of('/live').on(WsConnectStatusEnum.connection, (socket: Socket) => {
    console.log('live-ws链接ok');
    prettierInfoLog({ msg: 'connection', socket });

    // 断开连接中
    socket.on(WsConnectStatusEnum.disconnecting, (reason) => {
      prettierInfoLog({
        msg: '===== websocket断开连接中 =====',
        socket,
      });
      console.log(reason);
    });

    // 已断开连接
    socket.on(WsConnectStatusEnum.disconnect, (reason) => {
      try {
        prettierInfoLog({
          msg: '===== websocket已断开连接 =====',
          socket,
        });
        console.log(reason);
      } catch (error) {
        console.log(error);
      }
    });
  });
};
