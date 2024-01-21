import { isPureNumber } from 'billd-utils';
import { Op } from 'sequelize';

import { IList } from '@/interface';
import wechatUserModel from '@/model/wechatUser.model';
import { IWechatUser } from '@/types/IUser';
import { handlePaging } from '@/utils';

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
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = {};
    if (id !== undefined && isPureNumber(`${id}`)) {
      allWhere.id = id;
    }
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart!),
        [Op.lt]: new Date(+rangTimeEnd!),
      };
    }
    // if (created_at) {
    //   allWhere.created_at = {
    //     [Op.between]: [created_at, `${created_at} 23:59:59`],
    //   };
    // }
    // if (updated_at) {
    //   allWhere.updated_at = {
    //     [Op.between]: [updated_at, `${updated_at} 23:59:59`],
    //   };
    // }
    if (keyWord) {
      const keyWordWhere = [
        {
          nickname: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }
    // @ts-ignore
    const result = await wechatUserModel.findAndCountAll({
      attributes: {
        exclude: ['password', 'token'],
      },
      order: [[orderName, orderBy]],
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
  async create({
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
    const result = await wechatUserModel.create({
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
    });
    return result;
  }

  /** 删除wechat用户 */
  async delete(id: number) {
    const result = await wechatUserModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new WechatUserService();
