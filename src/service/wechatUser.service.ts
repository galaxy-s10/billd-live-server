import { deleteUseLessObjectKey } from 'billd-utils';
import { Op } from 'sequelize';

import { IList } from '@/interface';
import wechatUserModel from '@/model/wechatUser.model';
import { IWechatUser } from '@/types/IUser';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class WechatUserService {
  /** 所有应用里面是否存在wechat用户 */
  async isExistOpenid(openid: any) {
    const res = await wechatUserModel.count({
      where: {
        openid,
      },
    });
    return res === 1;
  }

  /** 同一个应用里面是否存在wechat用户 */
  async isExistClientIdOpenid(appid: any, openid: any) {
    const res = await wechatUserModel.count({
      where: {
        appid,
        openid,
      },
    });
    return res === 1;
  }

  async isExist(ids: number[]) {
    const res = await wechatUserModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res.length === ids.length;
  }

  /** 获取wechat用户列表 */
  async getList({
    id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IWechatUser>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
    });
    const rangTimeWhere = handleRangTime({
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    if (rangTimeWhere) {
      allWhere[rangTimeType!] = rangTimeWhere;
    }
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['nickname'],
    });
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
    }
    const orderRes = handleOrder({ orderName, orderBy });
    const result = await wechatUserModel.findAndCountAll({
      attributes: {
        exclude: ['password', 'token'],
      },
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 根据id查找wechat用户 */
  async find(id: number) {
    const result = await wechatUserModel.findOne({ where: { id } });
    return result;
  }

  /** 根据unionid查找wechat用户 */
  async findByOpenid(openid) {
    const result = await wechatUserModel.findOne({
      where: { openid },
    });
    return result;
  }

  /** 根据unionid修改wechat用户 */
  async update({
    appid,
    openid,
    nickname,
    sex,
    province,
    city,
    country,
    headimgurl,
    privilege,
    unionid,
  }: IWechatUser) {
    const result = await wechatUserModel.update(
      {
        appid,
        nickname,
        sex,
        province,
        city,
        country,
        headimgurl,
        privilege,
        unionid,
      },
      { where: { openid } }
    );
    return result;
  }

  /** 创建wechat用户 */
  async create(data: IWechatUser) {
    const result = await wechatUserModel.create(data);
    return result;
  }

  /** 删除wechat用户 */
  async delete(id: number) {
    const result = await wechatUserModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new WechatUserService();
