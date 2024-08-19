import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { IList, ISigninRecord } from '@/interface';
import roleModel from '@/model/role.model';
import signinRecordModel from '@/model/signinRecord.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

class SigninRecordService {
  /** 签到记录是否存在 */
  async isExist(ids: number[]) {
    const res = await signinRecordModel.count({
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
  }: IList<ISigninRecord>) {
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
    const result = await signinRecordModel.findAndCountAll({
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

    return handlePaging<ISigninRecord>(result, nowPage, pageSize);
  }

  /** 查找签到记录 */
  async find(id: number) {
    const result = await signinRecordModel.findOne({ where: { id } });
    return result;
  }

  /** 查找当天是否签到记录 */
  async findIsSignin({
    user_id,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ISigninRecord>) {
    const result = await signinRecordModel.findOne({
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
  async update(data: ISigninRecord) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await signinRecordModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建签到记录 */
  async findCountByUserId(user_id: number) {
    const result = await signinRecordModel.count({ where: { user_id } });
    return result;
  }

  /** 创建签到记录 */
  async create(data: ISigninRecord) {
    const result = await signinRecordModel.create(data);
    return result;
  }

  /** 删除签到记录 */
  async delete(id: number) {
    const result = await signinRecordModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new SigninRecordService();
