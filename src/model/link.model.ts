import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { ILink } from '@/interface';
import { initTable } from '@/utils';

interface LinkModel
  extends Model<InferAttributes<LinkModel>, InferCreationAttributes<LinkModel>>,
    ILink {}

const model = sequelize.define<LinkModel>(
  'link',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(100),
    },
    name: {
      type: DataTypes.STRING(100),
    },
    avatar: {
      type: DataTypes.STRING(150),
    },
    desc: {
      type: DataTypes.STRING(100),
    },
    url: {
      type: DataTypes.STRING(100),
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 2, // 1:已审核 2:未审核
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
