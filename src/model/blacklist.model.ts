import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IBlacklist } from '@/interface';
import { initTable } from '@/utils';

interface BlacklistModel
  extends Model<
      InferAttributes<BlacklistModel>,
      InferCreationAttributes<BlacklistModel>
    >,
    IBlacklist {}

const model = sequelize.define<BlacklistModel>(
  'blacklist',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    ip: {
      type: DataTypes.STRING(100),
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    type: {
      type: DataTypes.INTEGER, // 禁用类型,1:频繁操作；2:管理员手动禁用
    },
    msg: {
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

initTable(model);
export default model;
