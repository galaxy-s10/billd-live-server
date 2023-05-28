import { deleteUseLessObjectKey } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, IUserLiveRoom } from '@/interface';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import userLiveRoomModel from '@/model/userLiveRoom.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

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
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart!),
        [Op.lt]: new Date(+rangTimeEnd!),
      };
    }
    // @ts-ignore
    const result = await userLiveRoomModel.findAndCountAll({
      order: [[orderName, orderBy]],
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
        },
      ],
      where: { user_id },
    });
    return result;
  }

  /** 修改用户直播间 */
  async update({ id, user_id, live_room_id }: IUserLiveRoom) {
    const result = await userLiveRoomModel.update(
      {
        user_id,
        live_room_id,
      },
      { where: { id } }
    );
    return result;
  }

  /** 创建用户直播间 */
  async create({ user_id, live_room_id }: IUserLiveRoom) {
    const result = await userLiveRoomModel.create({
      user_id,
      live_room_id,
    });
    return result;
  }

  /** 删除用户直播间 */
  async delete(id: number) {
    const result = await userLiveRoomModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new UserLiveRoomService();
