import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IFrontend } from '@/interface';
import { initTable } from '@/utils';

interface FrontendModel
  extends Model<
      InferAttributes<FrontendModel>,
      InferCreationAttributes<FrontendModel>
    >,
    IFrontend {}

const model = sequelize.define<FrontendModel>(
  'frontend',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    // 废弃
    // frontend_login: {
    //   type: DataTypes.INTEGER,
    //   defaultValue: 1, // 1:关闭站内登录 2:开启站内登录
    // },
    // 废弃
    // frontend_register: {
    //   type: DataTypes.INTEGER,
    //   defaultValue: 1, // 1:关闭站内注册 2:开启站内注册
    // },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    desc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
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
