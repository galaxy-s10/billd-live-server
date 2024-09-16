import { createClient } from 'redis';

import { REDIS_CONFIG } from '@/secret/secret';
import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/utils/chalkTip';

export const pubClient = createClient({
  database: REDIS_CONFIG.database,
  socket: {
    port: REDIS_CONFIG.socket.port,
    host: REDIS_CONFIG.socket.host,
  },
  username: REDIS_CONFIG.username,
  password: REDIS_CONFIG.password,
});

const subClient = pubClient.duplicate();

export const createRedisPubSub = async () => {
  const msg = (flag: boolean) =>
    `创建${REDIS_CONFIG.socket.host}:${
      REDIS_CONFIG.socket.port
    }服务器的redis PubSub${flag ? '成功' : '失败'}!`;

  pubClient.on('error', (err) => {
    console.log(chalkERROR(msg(false)));
    console.log(err);
    process.exit(1);
  });

  console.log(
    chalkINFO(
      `开始创建${REDIS_CONFIG.socket.host}:${REDIS_CONFIG.socket.port}服务器的redis PubSub...`
    )
  );

  await Promise.all([pubClient.connect(), subClient.connect()]);
  // pubClient.connect(), subClient.connect()成功后，就不能pubClient.set()了，否则会报错Error: Cannot send commands in PubSub mode
  // 即redis发布订阅需要单独createClient和pubClient.duplicate()，并且pubClient只用作发布订阅，不能进行pubClient.set等操作

  await pubClient.configSet('notify-keyspace-events', 'Ex');
  // console.log(chalkINFO(`设置notify-keyspace-events: ${setRes}`));
  await pubClient.configGet('notify-keyspace-events');
  // console.log(
  //   chalkINFO(`获取notify-keyspace-events: ${getRes['notify-keyspace-events']}`)
  // );

  console.log(chalkSUCCESS(msg(true)));
};
