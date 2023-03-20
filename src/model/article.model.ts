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
import { IArticle } from '@/interface';
import { initTable } from '@/utils';

// const Sequelize = require('sequelize');

interface ArticleModel
  extends Model<
      InferAttributes<ArticleModel>,
      InferCreationAttributes<ArticleModel>
    >,
    IArticle {}

// https://sequelize.org/docs/v6/other-topics/typescript/#usage-of-sequelizedefine
const model = sequelize.define<ArticleModel>(
  // 这将控制自动生成的foreignKey和关联命名的名称
  'article', // 模型名称
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    desc: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    is_comment: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1:开启评论 2:关闭评论
    },
    priority: {
      type: DataTypes.INTEGER, // 权重
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 2, // 1:已审核 2:未审核
    },
    head_img: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    click: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    paranoid: true,
    freezeTableName: true, // 你可以使用 freezeTableName: true 参数停止 Sequelize 执行自动复数化. 这样,Sequelize 将推断表名称等于模型名称,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable(model);
export default model;
