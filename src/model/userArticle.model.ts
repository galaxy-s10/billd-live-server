import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IUserArticle } from '@/interface';
import { initTable } from '@/utils';

interface UserArticleModel
  extends Model<
      InferAttributes<UserArticleModel>,
      InferCreationAttributes<UserArticleModel>
    >,
    IUserArticle {}

const model = sequelize.define<UserArticleModel>(
  'user_article',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references: {
      //   model: userModel,
      //   key: 'id',
      // },
    },
    article_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references: {
      //   model: articleModel,
      //   key: 'id',
      // },
    },
  },
  {
    indexes: [
      {
        name: 'user_id',
        fields: ['user_id'],
      },
      {
        name: 'article_id',
        fields: ['article_id'],
      },
    ],
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable(model);
export default model;
