// import Sequelize from 'sequelize';//这种写法没有提示。
// import * as Sequelize from 'sequelize'; // 这种写法有提示。
// import Sequelize = require('sequelize'); // 这种写法有提示。
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { ITheme } from '@/interface';
import { initTable } from '@/utils';

// const Sequelize = require('sequelize');
interface ThemeModel
  extends Model<
      InferAttributes<ThemeModel>,
      InferCreationAttributes<ThemeModel>
    >,
    ITheme {}

const model = sequelize.define<ThemeModel>(
  // 这将控制自动生成的foreignKey和关联命名的名称
  'theme',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    model: {
      type: DataTypes.STRING(50),
      comment: '模块名',
      // unique: true, // 唯一约束,如果尝试插入已存在的model,将抛出 SequelizeUniqueConstraintError.
    },
    key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '变量key',
    },
    value: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '变量value',
      // validate: {
      //   len: [3, 100],
      // },
    },
    lang: {
      type: DataTypes.STRING(50),
      comment: '语言',
      // validate: {
      //   max: 50,
      // },
    },
    desc: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '简介',
      // validate: {
      //   max: 50,
      // },
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
