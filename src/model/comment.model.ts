import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IComment } from '@/interface';
import { initTable } from '@/utils';

interface CommentModel
  extends Model<
      InferAttributes<CommentModel>,
      InferCreationAttributes<CommentModel>
    >,
    IComment {}

const model = sequelize.define<CommentModel>(
  'comment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    article_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:留言板的评论 非-1:文章的评论
    },
    parent_comment_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:楼主 非-1:
    },
    reply_comment_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:楼主 非-1:
    },
    from_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    to_user_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:楼主 非-1:在楼主下回复的用户
    },
    content: {
      type: DataTypes.TEXT,
    },
    children_comment_total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    star_total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 状态：1显示；2不显示
    },
    ua: {
      type: DataTypes.STRING,
    },
    ip: {
      type: DataTypes.STRING,
    },
    ip_data: {
      type: DataTypes.STRING,
    },
  },
  {
    indexes: [
      {
        name: 'article_id',
        fields: ['article_id'],
      },
      {
        name: 'parent_comment_id',
        fields: ['parent_comment_id'],
      },
      {
        name: 'reply_comment_id',
        fields: ['reply_comment_id'],
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
