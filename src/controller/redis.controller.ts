import { redisClient } from '@/config/redis';

class RedisController {
  /**
   * @description: 从 Redis 2.8 开始，-1代表key 存在，但没有设置剩余生存时间；-2代表key不存在
   * @param {*} param1
   * @return {*}
   */
  getTTL = async ({ prefix, key }: { prefix: string; key: string }) => {
    const res = await redisClient.ttl(`${prefix}${key}`);
    return res;
  };

  del = async ({ prefix, key }: { prefix: string; key: string }) => {
    const res = await redisClient.del(`${prefix}${key}`);
    return res;
  };

  getVal = async ({ prefix, key }: { prefix: string; key: string }) => {
    const res = await redisClient.get(`${prefix}${key}`);
    return res;
  };

  setVal = async ({
    prefix,
    key,
    value,
    created_at,
  }: {
    prefix: string;
    key: string;
    value: Record<string, any>;
    created_at?: number;
  }) => {
    await redisClient.set(
      `${prefix}${key}`,
      JSON.stringify({
        value,
        created_at: created_at || +new Date(),
      })
    );
  };

  setExVal = async ({
    prefix,
    key,
    value,
    exp,
    created_at,
    expired_at,
  }: {
    prefix: string;
    key: string;
    value: Record<string, any>;
    /** 有效期，单位：秒 */
    exp: number;
    created_at?: number;
    expired_at?: number;
  }) => {
    await redisClient.setEx(
      `${prefix}${key}`,
      exp,
      JSON.stringify({
        value,
        created_at: created_at || +new Date(),
        expired_at: expired_at || +new Date() + exp * 1000,
      })
    );
  };

  setHashVal = async (
    key: string,
    field: string,
    value: Record<string, any>
  ) => {
    const res = await redisClient.hSetNX(
      key,
      field,
      JSON.stringify({
        value,
        created_at: +new Date(),
      })
    );
    return res;
  };

  delHashVal = async (key: string, field: string) => {
    const res = await redisClient.hDel(key, field);
    return res;
  };

  getHashVal = async (key: string, field: string) => {
    const res = await redisClient.hGet(key, field);
    return res;
  };

  getAllHashVal = async (key: string) => {
    const res = await redisClient.hVals(key);
    return res;
  };

  getHashLenVal = async (key: string) => {
    const res = await redisClient.hLen(key);
    return res;
  };

  setSetVal = async (key: string, value: Record<string, any>) => {
    const res = await redisClient.sAdd(
      key,
      JSON.stringify({
        value,
        created_at: +new Date(),
      })
    );
    return res;
  };

  getSetVal = async (key: string) => {
    const res = await redisClient.sMembers(key);
    return res;
  };

  setListVal = async (key: string, value: Record<string, any>) => {
    const res = await redisClient.lPush(
      key,
      JSON.stringify({
        value,
        created_at: +new Date(),
      })
    );
    return res;
  };

  getListVal = async (key: string) => {
    const res = await redisClient.lRange(key, 0, -1);
    return res;
  };
}

export default new RedisController();
