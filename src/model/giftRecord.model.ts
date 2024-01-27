import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { GiftRecordIsRecv, IGiftRecord } from '@/interface';

interface GoodsModel
  extends Model<
      InferAttributes<GoodsModel>,
      InferCreationAttributes<GoodsModel>
    >,
    IGiftRecord {}

const model = sequelize.define<GoodsModel>(
  'gift_record',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    is_recv: {
      type: DataTypes.INTEGER,
      defaultValue: GiftRecordIsRecv.no,
    },
    goods_id: {
      type: DataTypes.INTEGER,
    },
    goods_nums: {
      type: DataTypes.INTEGER,
    },
    goods_snapshot: {
      type: DataTypes.STRING(500),
    },
    order_id: {
      type: DataTypes.INTEGER,
    },
    live_room_id: {
      type: DataTypes.INTEGER,
    },
    send_user_id: {
      type: DataTypes.INTEGER,
    },
    recv_user_id: {
      type: DataTypes.INTEGER,
    },
    remark: {
      type: DataTypes.STRING(500),
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
