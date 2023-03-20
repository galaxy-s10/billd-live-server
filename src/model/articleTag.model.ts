import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IArticleTag } from '@/interface';
import { initTable } from '@/utils';

interface ArticleTagModel
  extends Model<
      InferAttributes<ArticleTagModel>,
      InferCreationAttributes<ArticleTagModel>
    >,
    IArticleTag {}

const model = sequelize.define<ArticleTagModel>(
  'article_tag',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    article_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        name: 'article_id',
        fields: ['article_id'],
      },
      {
        name: 'tag_id',
        fields: ['tag_id'],
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
