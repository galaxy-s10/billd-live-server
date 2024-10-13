import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { IGlobalMsg, IList } from '@/interface';
import globalMsgModel from '@/model/globalMsg.model';
import userModel from '@/model/user.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class GlobalMsgService {
  /** 全局消息是否存在 */
  async isExist(ids: number[]) {
    const res = await globalMsgModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取全局消息列表 */
  async getList({
    id,
    user_id,
    type,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IGlobalMsg>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      user_id,
      type,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['content', 'remark'],
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
    const result = await globalMsgModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
        },
      ],
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找全局消息 */
  async find(id: number) {
    const result = await globalMsgModel.findOne({ where: { id } });
    return result;
  }

  /** 修改全局消息 */
  async update(data: IGlobalMsg) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await globalMsgModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建全局消息 */
  async create(data: IGlobalMsg) {
    const result = await globalMsgModel.create(data);
    return result;
  }

  /** 删除全局消息 */
  async delete(id: number) {
    const result = await globalMsgModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new GlobalMsgService();
