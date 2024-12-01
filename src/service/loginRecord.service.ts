import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { IList, ILoginRecord } from '@/interface';
import loginRecordModel from '@/model/loginRecord.model';
import userModel from '@/model/user.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class LoginRecordService {
  /** 登录记录是否存在 */
  async isExist(ids: number[]) {
    const res = await loginRecordModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取登录记录列表 */
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
  }: IList<ILoginRecord>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      user_id,
      type,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['user_agent', 'client_ip', 'remark'],
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
    const result = await loginRecordModel.findAndCountAll({
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

  /** 查找登录记录 */
  async find(id: number) {
    const result = await loginRecordModel.findOne({ where: { id } });
    return result;
  }

  /** 修改登录记录 */
  async update(data: ILoginRecord) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await loginRecordModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建登录记录 */
  async create(data: ILoginRecord) {
    const result = await loginRecordModel.create(data);
    return result;
  }

  /** 删除登录记录 */
  async delete(id: number) {
    const result = await loginRecordModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new LoginRecordService();
