import { redisClient } from '@/config/redis';

class RedisController {
  /**
   * @description: 从 Redis 2.8 开始，-1代表key 存在，但没有设置剩余生存时间；-2代表key不存在
   * @param {*} param1
   * @return {*}
   */
  getTTL = async ({ prefix = '', key = '' }) => {
    const res = await redisClient.ttl(`${prefix}-${key}`);
    return res;
  };

  del = async ({ prefix = '', key = '' }) => {
    const res = await redisClient.del(`${prefix}-${key}`);
    return res;
  };

  getVal = async ({ prefix = '', key = '' }) => {
    const res = await redisClient.get(`${prefix}-${key}`);
    return res;
  };

  setVal = async ({
    prefix,
    key,
    value,
  }: {
    prefix: string;
    key: string;
    value: string;
  }) => {
    await redisClient.set(`${prefix}-${key}`, value); // string类型
  };

  setExVal = async ({
    prefix,
    key,
    value,
    exp,
  }: {
    prefix: string;
    key: string;
    value: string;
    /** 有效期，单位：秒 */
    exp: number;
  }) => {
    await redisClient.setEx(`${prefix}-${key}`, exp, value); // string类型
  };

  setHashVal = async (key: string, field: string, value: any) => {
    const res = await redisClient.hSetNX(key, field, JSON.stringify(value));
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

  setSetVal = async (key: string, value: string) => {
    const res = await redisClient.sAdd(key, value);
    return res;
  };

  getSetVal = async (key: string) => {
    const res = await redisClient.sMembers(key);
    return res;
  };

  setListVal = async (key: string, value: string) => {
    const res = await redisClient.lPush(key, value);
    return res;
  };

  getListVal = async (key: string) => {
    const res = await redisClient.lRange(key, 0, -1);
    return res;
  };
}

export default new RedisController();
