import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IOrder, PayStatusEnum } from '@/interface';

interface OrderModel
  extends Model<
      InferAttributes<OrderModel>,
      InferCreationAttributes<OrderModel>
    >,
    IOrder {}

const model = sequelize.define<OrderModel>(
  'order',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    billd_live_user_id: {
      type: DataTypes.INTEGER,
    },
    billd_live_goods_id: {
      type: DataTypes.INTEGER,
    },
    billd_live_live_room_id: {
      type: DataTypes.INTEGER,
    },
    client_ip: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    billd_live_order_subject: {
      type: DataTypes.STRING(100),
    },
    billd_live_order_version: {
      type: DataTypes.INTEGER,
    },
    product_code: {
      type: DataTypes.STRING(100),
    },
    qr_code: {
      type: DataTypes.STRING(100),
    },
    // 下面是支付中、已支付返回的信息
    buyer_logon_id: {
      type: DataTypes.STRING(100),
    },
    buyer_user_id: {
      type: DataTypes.STRING(100),
    },
    buyer_pay_amount: {
      type: DataTypes.STRING,
    },
    total_amount: {
      type: DataTypes.STRING,
    },
    invoice_amount: {
      type: DataTypes.STRING,
    },
    point_amount: {
      type: DataTypes.STRING,
    },
    receipt_amount: {
      type: DataTypes.STRING,
    },
    trade_no: {
      type: DataTypes.STRING(100),
    },
    out_trade_no: {
      type: DataTypes.STRING(100),
    },
    trade_status: {
      type: DataTypes.STRING(100),
      defaultValue: PayStatusEnum.wait,
    },
    send_pay_date: {
      type: DataTypes.STRING(100),
    },
  },
  {
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable({ model, sequelize });

export default model;
