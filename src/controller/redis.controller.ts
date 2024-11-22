import { redisClient } from '@/config/redis';

class RedisController {
  /**
   * @description: 从 Redis 2.8 开始，-1代表key 存在，但没有设置剩余生存时间；-2代表key不存在
   * @param {*} param1
   * @return {*}
   */
  getTTL = (data: { prefix: string; key: string }) => {
    return redisClient.ttl(`${data.prefix}${data.key}`);
  };

  del = (data: { prefix: string; key: string }) => {
    return redisClient.del(`${data.prefix}${data.key}`);
  };

  findByPrefix = (data: { prefix: string }) => {
    return redisClient.keys(`${data.prefix}*`);
  };

  delByPrefix = async (data: { prefix: string }) => {
    const res = await redisClient.keys(`${data.prefix}*`);
    const queue: Promise<any>[] = [];
    res.forEach((key) => {
      queue.push(redisClient.del(key));
    });
    await Promise.all(queue);
    return res;
  };

  getVal = (data: { prefix: string; key: string }) => {
    return redisClient.get(`${data.prefix}${data.key}`);
  };

  setVal = (data: { prefix: string; key: string; value: any }) => {
    return redisClient.set(
      `${data.prefix}${data.key}`,
      JSON.stringify({
        created_at: +new Date(),
        value: data.value,
      })
    );
  };

  setExVal = (data: {
    prefix: string;
    key: string;
    value: any;
    /** 有效期，单位：秒 */
    exp: number;
    client_ip?: string;
  }) => {
    return redisClient.setEx(
      `${data.prefix}${data.key}`,
      data.exp,
      JSON.stringify({
        created_at: +new Date(),
        client_ip: data.client_ip || '',
        value: data.value,
      })
    );
  };

  setHashVal = (data: {
    key: string;
    field: string;
    value: any;
    client_ip: string;
  }) => {
    // 执行HSET命令并指定已存在的字段，那么这个字段的值会被新值覆盖。
    // 你不希望覆盖已存在的字段的值，你可以使用hSetNX命令，这个命令只有在指定的字段不存在时，才会设置值。
    return redisClient.hSet(
      data.key,
      data.field,
      JSON.stringify({
        created_at: +new Date(),
        client_ip: data.client_ip,
        value: data.value,
      })
    );
  };

  delHashVal = (data: { key: string; field: string }) => {
    return redisClient.hDel(data.key, data.field);
  };

  setExpire = (data: { key: string; seconds: number }) => {
    return redisClient.expire(data.key, data.seconds);
  };

  getHashVal = (data: { key: string; field: string }) => {
    return redisClient.hGet(data.key, data.field);
  };

  getAllHashVal = (key: string) => {
    return redisClient.hVals(key);
  };

  getHashLenVal = (key: string) => {
    return redisClient.hLen(key);
  };

  setSetVal = (data: { key: string; value: any }) => {
    return redisClient.sAdd(
      data.key,
      JSON.stringify({
        created_at: +new Date(),
        value: data.value,
      })
    );
  };

  getSetVal = (key: string) => {
    return redisClient.sMembers(key);
  };

  setListVal = (data: { key: string; value: any }) => {
    return redisClient.lPush(
      data.key,
      JSON.stringify({
        created_at: +new Date(),
        value: data.value,
      })
    );
  };

  getListVal = (key: string) => {
    return redisClient.lRange(key, 0, -1);
  };
}

export default new RedisController();
