import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IRole } from '@/interface';

interface RoleModel
  extends Model<InferAttributes<RoleModel>, InferCreationAttributes<RoleModel>>,
    IRole {}

const model = sequelize.define<RoleModel>(
  'role',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    role_name: {
      type: DataTypes.STRING(50),
    },
    role_value: {
      type: DataTypes.STRING(50),
    },
    type: {
      type: DataTypes.INTEGER, // 1：默认，2：自定义
    },
    priority: {
      type: DataTypes.INTEGER,
    },
    p_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // 0:最外层的父级
    },
  },
  {
    indexes: [
      {
        name: 'p_id',
        fields: ['p_id'],
      },
    ],
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable({ model, sequelize });

export default model;
