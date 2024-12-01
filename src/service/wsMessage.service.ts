import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { IList, IWsMessage } from '@/interface';
import roleModel from '@/model/role.model';
import userModel from '@/model/user.model';
import wsMessageModel from '@/model/wsMessage.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

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
    id,
    live_record_id,
    username,
    origin_username,
    content_type,
    content,
    origin_content,
    live_room_id,
    user_id,
    client_ip,
    msg_type,
    user_agent,
    send_msg_time,
    is_show,
    remark,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IWsMessage>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      live_record_id,
      username,
      origin_username,
      content_type,
      content,
      origin_content,
      live_room_id,
      user_id,
      client_ip,
      msg_type,
      user_agent,
      send_msg_time,
      is_show,
      remark,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: [
        'content',
        'origin_content',
        'username',
        'origin_username',
        'user_agent',
      ],
    });
    if (keyWordWhere) {
      allWhere[Op.or] = keyWordWhere;
    }
    const rangTimeWhere = handleRangTime({
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    if (rangTimeWhere) {
      allWhere[rangTimeType!] = rangTimeWhere;
    }
    const orderRes = handleOrder({ orderName, orderBy });
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
          include: [
            {
              model: roleModel,
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

    return handlePaging(result, nowPage, pageSize);
  }

  async getCountByLiveRecordId(live_record_id: number) {
    const result = await wsMessageModel.count({ where: { live_record_id } });
    return result;
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
