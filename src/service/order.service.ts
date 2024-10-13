import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, IOrder } from '@/interface';
import orderModel from '@/model/order.model';
import userModel from '@/model/user.model';
import {
  handleKeyWord,
  handleOrder,
  handlePage,
  handlePaging,
  handleRangTime,
} from '@/utils';

const { Op, literal } = Sequelize;

class OrderService {
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
    billd_live_goods_id,
    billd_live_live_room_id,
    billd_live_user_id,
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
    const { offset, limit } = handlePage({ nowPage, pageSize });
    const allWhere: any = deleteUseLessObjectKey({
      id,
      billd_live_goods_id,
      billd_live_live_room_id,
      billd_live_user_id,
      trade_status,
    });
    const keyWordWhere = handleKeyWord({
      keyWord,
      arr: [
        'billd_live_order_subject',
        'trade_no',
        'out_trade_no',
        'buyer_logon_id',
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
    const result = await orderModel.findAndCountAll({
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

  /** 查找订单 */
  async find(id: number) {
    const result = await orderModel.findOne({ where: { id } });
    return result;
  }

  /** 查找订单 */
  async findByOutTradeNo(out_trade_no: string) {
    const result = await orderModel.findOne({
      where: { out_trade_no },
    });
    return result;
  }

  /** 支付成功 */
  async updatePayOk({
    id,
    client_ip,
    billd_live_user_id,
    billd_live_goods_id,
    billd_live_live_room_id,
    billd_live_order_subject,
    billd_live_order_version,
    product_code,
    qr_code,
    buyer_logon_id,
    buyer_user_id,
    buyer_pay_amount,
    total_amount,
    invoice_amount,
    point_amount,
    receipt_amount,
    trade_no,
    out_trade_no,
    send_pay_date,
    trade_status,
  }: IOrder) {
    const result = await orderModel.update(
      {
        client_ip,
        billd_live_user_id,
        billd_live_goods_id,
        billd_live_live_room_id,
        billd_live_order_subject,
        billd_live_order_version: literal('`billd_live_order_version` +1'),
        product_code,
        qr_code,
        buyer_logon_id,
        buyer_user_id,
        buyer_pay_amount,
        total_amount,
        invoice_amount,
        point_amount,
        receipt_amount,
        trade_no,
        out_trade_no,
        send_pay_date,
        trade_status,
      },
      { where: { id, billd_live_order_version } }
    );
    return result;
  }

  /** 修改订单 */
  async update(data: IOrder) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await orderModel.update(data2, { where: { id }, limit: 1 });
    return result;
  }

  /** 创建订单 */
  async create(data: IOrder) {
    const result = await orderModel.create(data);
    return result;
  }

  /** 删除订单 */
  async delete(id: number) {
    const result = await orderModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new OrderService();
