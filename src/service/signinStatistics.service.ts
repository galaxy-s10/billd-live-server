import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { LIVE_ROOM_MODEL_EXCLUDE } from '@/constant';
import { IList, ISigninStatistics } from '@/interface';
import areaModel from '@/model/area.model';
import liveRoomModel from '@/model/liveRoom.model';
import roleModel from '@/model/role.model';
import signinStatisticsModel from '@/model/signinStatistics.model';
import userModel from '@/model/user.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class SigninStatisticsService {
  /** 签到统计是否存在 */
  async isExist(ids: number[]) {
    const res = await signinStatisticsModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取签到统计列表 */
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
  }: IList<ISigninStatistics>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      user_id,
      live_room_id,
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
      arr: [],
    });
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
    }
    const orderRes = handleOrder({ orderName, orderBy });
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
    const result = await signinStatisticsModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          where: {
            ...userWhere,
          },
          include: [
            {
              model: roleModel,
              through: { attributes: [] },
            },
          ],
        },
        {
          model: liveRoomModel,
          attributes: {
            exclude: LIVE_ROOM_MODEL_EXCLUDE,
          },
          include: [
            {
              model: areaModel,
              through: {
                attributes: [],
              },
            },
          ],
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

    return handlePaging<ISigninStatistics>(result, nowPage, pageSize);
  }

  /** 查找签到统计 */
  async find(id: number) {
    const result = await signinStatisticsModel.findOne({ where: { id } });
    return result;
  }

  /** 查找签到统计 */
  async findByUserId(user_id: number) {
    const result = await signinStatisticsModel.findOne({
      where: { user_id },
    });
    return result;
  }

  /** 查找当天是否签到统计 */
  async findIsSignin({
    user_id,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ISigninStatistics>) {
    const result = await signinStatisticsModel.findOne({
      where: {
        user_id,
        created_at: {
          [Op.between]: [new Date(rangTimeStart!), new Date(rangTimeEnd!)],
        },
      },
    });
    return result;
  }

  /** 修改签到统计 */
  async update(data: ISigninStatistics) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await signinStatisticsModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建签到统计 */
  async create(data: ISigninStatistics) {
    const result = await signinStatisticsModel.create(data);
    return result;
  }

  /** 删除签到统计 */
  async delete(id: number) {
    const result = await signinStatisticsModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new SigninStatisticsService();
