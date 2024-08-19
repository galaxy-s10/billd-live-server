import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';
import { IList, IWsMessage } from '@/interface';
import roleModel from '@/model/role.model';
import userModel from '@/model/user.model';
import wsMessageModel from '@/model/wsMessage.model';
import { handlePaging } from '@/utils';

async function handleDelRedisByDbLiveRoomHistoryMsgList() {
  try {
    await redisController.del({
      prefix: REDIS_PREFIX.dbLiveRoomHistoryMsgList,
      key: '',
    });
  } catch (error) {
    console.log(error);
  }
}

class WsMessageService {
  /** 消息是否存在 */
  async isExist(ids: number[]) {
    const res = await wsMessageModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取消息列表 */
  async getList({
    msg_type,
    redbag_send_id,
    live_room_id,
    user_id,
    msg_is_file,
    ip,
    is_show,
    is_verify,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IWsMessage>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      msg_type,
      user_id,
      live_room_id,
      ip,
      msg_is_file,
      redbag_send_id,
      is_show,
      is_verify,
    });
    if (keyWord) {
      const keyWordWhere = [
        {
          content: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          origin_content: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          username: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          origin_username: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          user_agent: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }
    if (rangTimeType && rangTimeStart && rangTimeEnd) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart),
        [Op.lt]: new Date(+rangTimeEnd),
      };
    }
    const orderRes: any[] = [];
    if (orderName && orderBy) {
      orderRes.push([orderName, orderBy]);
    }
    const userWhere = deleteUseLessObjectKey({});

    const result = await wsMessageModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
          where: {
            ...userWhere,
          },
          include: [{ model: roleModel }],
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

    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找消息 */
  async find(id: number) {
    const result = await wsMessageModel.findOne({ where: { id } });
    return result;
  }

  /** 创建消息 */
  async create(data: IWsMessage) {
    const result = await wsMessageModel.create(data);
    return result;
  }

  /** 更新消息 */
  async update(data: IWsMessage) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await wsMessageModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 删除消息 */
  async delete(id: number) {
    const result = await wsMessageModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new WsMessageService();
