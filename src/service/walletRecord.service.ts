import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import { Op } from 'sequelize';

import { IList, IWalletRecord } from '@/interface';
import walletRecordModel from '@/model/walletRecord.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

class WalletRecordService {
  /** 钱包记录是否存在 */
  async isExist(ids: number[]) {
    const res = await walletRecordModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取钱包记录列表 */
  async getList({
    id,
    user_id,
    order_id,
    type,
    name,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IWalletRecord>) {
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      user_id,
      order_id,
      type,
      name,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: ['name', 'remark'],
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
    const result = await walletRecordModel.findAndCountAll({
      order: [...orderRes],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找钱包记录 */
  async find(id: number) {
    const result = await walletRecordModel.findOne({ where: { id } });
    return result;
  }

  /** 修改钱包记录 */
  async update(data: IWalletRecord) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await walletRecordModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 创建钱包记录 */
  async create(data: IWalletRecord) {
    const result = await walletRecordModel.create(data);
    return result;
  }

  /** 删除钱包记录 */
  async delete(id: number) {
    const result = await walletRecordModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new WalletRecordService();
