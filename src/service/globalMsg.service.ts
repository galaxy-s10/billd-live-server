import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { IGlobalMsg, IList } from '@/interface';
import globalMsgModel from '@/model/globalMsg.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

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
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      user_id,
      type,
    });
    if (keyWord) {
      const keyWordWhere = [
        {
          content: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          remark: {
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
