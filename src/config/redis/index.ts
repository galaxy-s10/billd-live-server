import { createClient } from 'redis';

import { REDIS_CONFIG } from '@/secret/secret';
import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/utils/chalkTip';

export const redisClient = createClient({
  database: REDIS_CONFIG.database,
  socket: {
    port: REDIS_CONFIG.socket.port,
    host: REDIS_CONFIG.socket.host,
    tls: false,
  },
  username: REDIS_CONFIG.username,
  password: REDIS_CONFIG.password,
});

export const connectRedis = async () => {
  const msg = (flag: boolean) =>
    `连接${REDIS_CONFIG.socket.host}:${
      REDIS_CONFIG.socket.port
    }服务器的redis数据库${flag ? '成功' : '失败'}!`;

  redisClient.on('error', (err) => {
    console.log(chalkERROR(msg(false)));
    console.log(err);
  });

  console.log(
    chalkINFO(
      `开始连接${REDIS_CONFIG.socket.host}:${REDIS_CONFIG.socket.port}服务器的redis数据库...`
    )
  );
  await redisClient.connect();
  console.log(chalkSUCCESS(msg(true)));
  return redisClient;
};
