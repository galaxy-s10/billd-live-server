import { deleteUseLessObjectKey } from 'billd-utils';
import { Op } from 'sequelize';

import { IList } from '@/interface';
import qqUserModel from '@/model/qqUser.model';
import { IQqUser } from '@/types/IUser';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class QQUserService {
  /** 所有应用里面是否存在qq用户 */
  async isExistUnionid(unionid: any) {
    const res = await qqUserModel.count({
      where: {
        unionid,
      },
    });
    return res === 1;
  }

  /** 同一个应用里面是否存在qq用户 */
  async isExistClientIdUnionid(client_id: any, unionid: any) {
    const res = await qqUserModel.count({
      where: {
        client_id,
        unionid,
      },
    });
    return res === 1;
  }

  async isExist(ids: number[]) {
    const res = await qqUserModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res.length === ids.length;
  }

  /** 获取qq用户列表 */
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
  }: IList<IQqUser>) {
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
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['nickname'],
    });
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
    }
    const orderRes = handleOrder({ orderName, orderBy });
    const result = await qqUserModel.findAndCountAll({
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

  /** 根据id查找qq用户 */
  async find(id: number) {
    const result = await qqUserModel.findOne({ where: { id } });
    return result;
  }

  /** 根据unionid查找qq用户 */
  async findByUnionid(unionid) {
    const result = await qqUserModel.findOne({
      where: { unionid },
    });
    return result;
  }

  /** 根据unionid修改qq用户 */
  async update({
    client_id,
    openid,
    unionid,
    nickname,
    figureurl,
    figureurl_1,
    figureurl_2,
    figureurl_qq_1,
    figureurl_qq_2,
    constellation,
    gender,
    city,
    province,
    year,
  }: IQqUser) {
    const result = await qqUserModel.update(
      {
        nickname,
        figureurl,
        figureurl_1,
        figureurl_2,
        figureurl_qq_1,
        figureurl_qq_2,
        constellation,
        gender,
        city,
        province,
        year,
        openid,
        client_id,
      },
      { where: { unionid } }
    );
    return result;
  }

  /** 创建qq用户 */
  async create({
    nickname,
    client_id,
    openid,
    unionid,
    figureurl,
    figureurl_1,
    figureurl_2,
    figureurl_qq_1,
    figureurl_qq_2,
    gender,
    year,
    city,
    province,
    constellation,
  }: IQqUser) {
    const result = await qqUserModel.create({
      nickname,
      client_id,
      openid,
      unionid,
      figureurl,
      figureurl_1,
      figureurl_2,
      figureurl_qq_1,
      figureurl_qq_2,
      gender,
      year,
      city,
      province,
      constellation,
    });
    return result;
  }

  /** 删除qq用户 */
  async delete(id: number) {
    const result = await qqUserModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new QQUserService();
