import { deleteUseLessObjectKey } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, ILiveRoom } from '@/interface';
import liveModel from '@/model/live.model';
import liveRoomModel from '@/model/liveRoom.model';
import userModel from '@/model/user.model';
import userLiveRoomModel from '@/model/userLiveRoom.model';
import { handlePaging } from '@/utils';

const { Op, col } = Sequelize;

class LiveRoomService {
  /** 直播间是否存在 */
  async isExist(ids: number[]) {
    const res = await liveRoomModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取直播间列表 */
  async getList({
    id,
    roomName,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILiveRoom>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      roomName,
    });
    if (keyWord) {
      const keyWordWhere = [
        {
          roomName: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart!),
        [Op.lt]: new Date(+rangTimeEnd!),
      };
    }
    // @ts-ignore
    const result = await liveRoomModel.findAndCountAll({
      include: [
        {
          model: userLiveRoomModel,
          include: [
            {
              model: userModel,
              attributes: {
                exclude: ['password', 'token'],
              },
            },
          ],
          required: true,
          attributes: [],
        },
        {
          model: liveModel,
        },
      ],
      attributes: {
        include: [
          [col('user_live_room.user.id'), 'user_id'],
          [col('user_live_room.user.username'), 'user_username'],
          [col('user_live_room.user.avatar'), 'user_avatar'],
        ],
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

  /** 查找直播间 */
  async find(id: number) {
    const result = await liveRoomModel.findOne({ where: { id } });
    return result;
  }

  /** 修改直播间 */
  async update({ id, roomName }: ILiveRoom) {
    const result = await liveRoomModel.update(
      {
        roomName,
      },
      { where: { id } }
    );
    return result;
  }

  /** 创建直播间 */
  async create({ roomName }: ILiveRoom) {
    const result = await liveRoomModel.create({
      roomName,
    });
    return result;
  }

  /** 删除直播间 */
  async delete(id: number) {
    const result = await liveRoomModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new LiveRoomService();
