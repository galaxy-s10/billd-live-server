import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { LIVE_ROOM_MODEL_EXCLUDE } from '@/constant';
import { IList, IUserLiveRoom } from '@/interface';
import areaModel from '@/model/area.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import userLiveRoomModel from '@/model/userLiveRoom.model';
import { handleOrder, handlePage, handlePaging, handleRangTime } from '@/utils';

class UserLiveRoomService {
  /** 用户直播间是否存在 */
  async isExist(ids: number[]) {
    const res = await userLiveRoomModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取用户直播间列表 */
  async getList({
    id,
    user_id,
    live_room_id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IUserLiveRoom>) {
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
    const orderRes = handleOrder({ orderName, orderBy });
    const result = await userLiveRoomModel.findAndCountAll({
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找用户直播间 */
  async find(id: number) {
    const result = await userLiveRoomModel.findOne({ where: { id } });
    return result;
  }

  async findAll() {
    const result = await userLiveRoomModel.findAll();
    return result;
  }

  /** 查找用户直播间 */
  async findByUserId(user_id: number) {
    const result = await userLiveRoomModel.findOne({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
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
      where: { user_id },
    });
    return result;
  }

  /** 查找用户直播间 */
  async findByLiveRoomId(live_room_id: number) {
    const result = await userLiveRoomModel.findOne({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
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
      where: { live_room_id },
    });
    return result;
  }

  /** 查找用户直播间带key */
  async findByLiveRoomIdAndKey(live_room_id: number) {
    const result = await userLiveRoomModel.findOne({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
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
      where: { live_room_id },
    });
    return result;
  }

  /** 修改用户直播间 */
  async update(data: IUserLiveRoom) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await userLiveRoomModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建用户直播间 */
  async create(data: IUserLiveRoom) {
    const result = await userLiveRoomModel.create(data);
    return result;
  }

  /** 删除用户直播间 */
  async delete(id: number) {
    const result = await userLiveRoomModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new UserLiveRoomService();
