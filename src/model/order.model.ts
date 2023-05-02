import { DataTypes } from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/utils';

const model = sequelize.define(
  'order',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    out_trade_no: {
      type: DataTypes.STRING(100),
    },
    total_amount: {
      type: DataTypes.STRING(100),
    },
    subject: {
      type: DataTypes.STRING(100),
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
    buyer_pay_amount: {
      type: DataTypes.STRING(100),
    },
    buyer_user_id: {
      type: DataTypes.STRING(100),
    },
    invoice_amount: {
      type: DataTypes.STRING(100),
    },
    point_amount: {
      type: DataTypes.STRING(100),
    },
    receipt_amount: {
      type: DataTypes.STRING(100),
    },
    send_pay_date: {
      // 支付时间（支付成功的）
      type: DataTypes.STRING(100),
    },
    trade_no: {
      type: DataTypes.STRING(100),
    },
    trade_status: {
      type: DataTypes.STRING(100),
      defaultValue: 'error',
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

initTable(model);
export default model;
