import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IInteraction } from '@/interface';
import { initTable } from '@/utils';

interface IInteractionModel
  extends Model<
      InferAttributes<IInteractionModel>,
      InferCreationAttributes<IInteractionModel>
    >,
    IInteraction {}

const model = sequelize.define<IInteractionModel>(
  'interaction',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    // 客户端ip
    client_ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 客户端信息
    client: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 用户类型
    user_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 用户信息
    user_info: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 消息类型
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 消息内容
    value: {
      type: DataTypes.STRING,
      allowNull: false,
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
