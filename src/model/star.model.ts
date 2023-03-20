import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IStar } from '@/interface';
import { initTable } from '@/utils';

interface StarModel
  extends Model<InferAttributes<StarModel>, InferCreationAttributes<StarModel>>,
    IStar {}

const model = sequelize.define<StarModel>(
  'star',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    article_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:给用户的star 非-1:给这篇文章的star
    },
    comment_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:给文章的star 非-1:给这条评论的star
    },
    from_user_id: {
      type: DataTypes.INTEGER,
    },
    to_user_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:给文章的star 非-1:给这个用户star
    },
  },
  {
    indexes: [
      {
        name: 'article_id',
        fields: ['article_id'],
      },
      {
        name: 'comment_id',
        fields: ['comment_id'],
      },
      {
        name: 'from_user_id',
        fields: ['from_user_id'],
      },
      {
        name: 'to_user_id',
        fields: ['to_user_id'],
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
