import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IWallet } from '@/interface';
import { initTable } from '@/utils';

interface WalletModel
  extends Model<
      InferAttributes<WalletModel>,
      InferCreationAttributes<WalletModel>
    >,
    IWallet {}

const model = sequelize.define<WalletModel>(
  'wallet',
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
    balance: {
      type: DataTypes.STRING,
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
