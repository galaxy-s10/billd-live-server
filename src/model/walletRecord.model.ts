import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IWalletRecord } from '@/interface';

interface WalletModel
  extends Model<
      InferAttributes<WalletModel>,
      InferCreationAttributes<WalletModel>
    >,
    IWalletRecord {}

const model = sequelize.define<WalletModel>(
  'wallet_record',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    order_id: {
      type: DataTypes.INTEGER,
    },
    type: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING(200),
    },
    amount: {
      type: DataTypes.INTEGER,
    },
    amount_status: {
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
