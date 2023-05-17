import { deleteUseLessObjectKey } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, IOrder } from '@/interface';
import orderModel from '@/model/order.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;
class MusicService {
  /** 订单是否存在 */
  async isExist(ids: number[]) {
    const res = await orderModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取订单列表 */
  async getList({
    id,
    trade_status,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IOrder>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      trade_status,
    });
    if (keyWord) {
      const keyWordWhere = [
        {
          socketId: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          roomId: {
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
    const result = await orderModel.findAndCountAll({
      include: [
        {
          model: userModel,
          attributes: {
            exclude: ['password', 'token'],
          },
        },
      ],
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找订单 */
  async find(id: number) {
    const result = await orderModel.findOne({ where: { id } });
    return result;
  }

  /** 查找订单 */
  async findByOutTradeNo(out_trade_no: string) {
    const result = await orderModel.findOne({ where: { out_trade_no } });
    return result;
  }

  /** 修改订单 */
  async update({
    id,
    billd_live_user_id,
    out_trade_no,
    total_amount,
    subject,
    product_code,
    qr_code,
    buyer_logon_id,
    buyer_pay_amount,
    buyer_user_id,
    invoice_amount,
    point_amount,
    receipt_amount,
    send_pay_date,
    trade_no,
    trade_status,
  }: IOrder) {
    const result = await orderModel.update(
      {
        billd_live_user_id,
        out_trade_no,
        total_amount,
        subject,
        product_code,
        qr_code,
        buyer_logon_id,
        buyer_pay_amount,
        buyer_user_id,
        invoice_amount,
        point_amount,
        receipt_amount,
        send_pay_date,
        trade_no,
        trade_status,
      },
      { where: { id } }
    );
    return result;
  }

  /** 创建订单 */
  async create({
    billd_live_user_id,
    out_trade_no,
    total_amount,
    subject,
    product_code,
    qr_code,
    buyer_logon_id,
    buyer_pay_amount,
    buyer_user_id,
    invoice_amount,
    point_amount,
    receipt_amount,
    send_pay_date,
    trade_no,
    trade_status,
  }: IOrder) {
    const result = await orderModel.create({
      billd_live_user_id,
      out_trade_no,
      total_amount,
      subject,
      product_code,
      qr_code,
      buyer_logon_id,
      buyer_pay_amount,
      buyer_user_id,
      invoice_amount,
      point_amount,
      receipt_amount,
      send_pay_date,
      trade_no,
      trade_status,
    });
    return result;
  }

  /** 删除订单 */
  async delete(id: number) {
    const result = await orderModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new MusicService();
