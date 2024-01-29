import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { IList, ISignin } from '@/interface';
import roleModel from '@/model/role.model';
import signinModel from '@/model/signin.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

class SigninService {
  /** 签到记录是否存在 */
  async isExist(ids: number[]) {
    const res = await signinModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取签到记录列表 */
  async getList({
    id,
    username,
    user_id,
    live_room_id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ISignin>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      user_id,
      live_room_id,
    });
    if (rangTimeType && rangTimeStart && rangTimeEnd) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart),
        [Op.lt]: new Date(+rangTimeEnd),
      };
    }
    if (keyWord) {
      const keyWordWhere = [];
      allWhere[Op.or] = keyWordWhere;
    }
    const orderRes: any[] = [];
    if (orderName && orderBy) {
      orderRes.push([orderName, orderBy]);
    }
    const userWhere = deleteUseLessObjectKey({
      id: user_id,
    });
    if (username) {
      const keyWordWhere = [
        {
          username: {
            [Op.like]: `%${username}%`,
          },
        },
      ];
      userWhere[Op.or] = keyWordWhere;
    }
    const result = await signinModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          where: {
            ...userWhere,
          },
          include: [{ model: roleModel, through: { attributes: [] } }],
        },
      ],
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
      distinct: true,
    });

    return handlePaging<ISignin>(result, nowPage, pageSize);
  }

  /** 查找签到记录 */
  async find(id: number) {
    const result = await signinModel.findOne({ where: { id } });
    return result;
  }

  /** 查找当天是否签到记录 */
  async findIsSignin({ user_id, rangTimeStart, rangTimeEnd }: IList<ISignin>) {
    const result = await signinModel.findOne({
      where: {
        user_id,
        created_at: {
          [Op.between]: [new Date(rangTimeStart!), new Date(rangTimeEnd!)],
        },
      },
    });
    return result;
  }

  /** 修改签到记录 */
  async update(data: ISignin) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await signinModel.update(data2, { where: { id } });
    return result;
  }

  /** 创建签到记录 */
  async create(data: ISignin) {
    const result = await signinModel.create(data);
    return result;
  }

  /** 删除签到记录 */
  async delete(id: number) {
    const result = await signinModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new SigninService();
