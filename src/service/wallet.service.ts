import { deleteUseLessObjectKey } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, IWallet } from '@/interface';
import userModel from '@/model/user.model';
import walletModel from '@/model/wallet.model';
import { handlePaging } from '@/utils';

const { Op, col, cast } = Sequelize;

class WalletService {
  /** 钱包是否存在 */
  async isExist(ids: number[]) {
    const res = await walletModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取钱包列表 */
  async getList({
    id,
    user_id,
    balance,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IWallet>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      user_id,
      balance,
    });
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart!),
        [Op.lt]: new Date(+rangTimeEnd!),
      };
    }
    // @ts-ignore
    const result = await walletModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
        },
      ],
      order:
        orderName && orderBy && orderName !== 'balance'
          ? [
              [cast(col('balance'), 'INTEGER'), 'DESC'],
              [orderName, orderBy],
            ]
          : [[cast(col('balance'), 'INTEGER'), 'DESC']],
      limit,
      offset,
      attributes: {
        include: [[cast(col('balance'), 'float'), 'aaa']],
      },
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找钱包 */
  async find(id: number) {
    const result = await walletModel.findOne({ where: { id } });
    return result;
  }

  /** 查找钱包 */
  async findByUserId(user_id: number) {
    const result = await walletModel.findOne({ where: { user_id } });
    return result;
  }

  /** 修改钱包 */
  async updateByUserId({ user_id, balance }: IWallet) {
    const result = await walletModel.update(
      {
        balance,
      },
      { where: { user_id } }
    );
    return result;
  }

  /** 修改钱包 */
  async update({ id, user_id, balance }: IWallet) {
    const result = await walletModel.update(
      {
        user_id,
        balance,
      },
      { where: { id } }
    );
    return result;
  }

  /** 创建钱包 */
  async create({ user_id, balance }: IWallet) {
    const result = await walletModel.create({
      user_id,
      balance,
    });
    return result;
  }

  /** 删除钱包 */
  async delete(id: number) {
    const result = await walletModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new WalletService();
