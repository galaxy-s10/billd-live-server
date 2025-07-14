import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IGithubUser } from '@/interface';
import { initTable } from '@/utils';

interface GithubUserModel
  extends Model<
      InferAttributes<GithubUserModel>,
      InferCreationAttributes<GithubUserModel>
    >,
    IGithubUser {}

const model = sequelize.define<GithubUserModel>(
  'github_user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    client_id: {
      // https://github.com/settings/applications里面的Client ID
      type: DataTypes.STRING,
    },
    login: {
      type: DataTypes.STRING,
    },
    github_id: {
      type: DataTypes.INTEGER,
    },
    node_id: {
      type: DataTypes.STRING,
    },
    avatar_url: {
      type: DataTypes.STRING,
    },
    gravatar_id: {
      type: DataTypes.STRING,
    },
    url: {
      type: DataTypes.STRING,
    },
    html_url: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    site_admin: {
      type: DataTypes.STRING,
    },
    name: {
      // 用户的新名称。
      type: DataTypes.STRING,
    },
    company: {
      // 用户的新公司。
      type: DataTypes.STRING,
    },
    blog: {
      // 用户的新博客 URL。
      type: DataTypes.STRING,
    },
    location: {
      // 用户的新位置。
      type: DataTypes.STRING,
    },
    email: {
      // 用户公开可见的电子邮件地址。
      type: DataTypes.STRING,
    },
    hireable: {
      // 用户的新招聘可用性。
      type: DataTypes.STRING,
    },
    bio: {
      // 用户的新短传。
      type: DataTypes.STRING,
    },
    twitter_username: {
      // 用户的新 Twitter 用户名。
      type: DataTypes.STRING,
    },
    public_repos: {
      type: DataTypes.INTEGER,
    },
    public_gists: {
      type: DataTypes.INTEGER,
    },
    followers: {
      type: DataTypes.INTEGER,
    },
    following: {
      type: DataTypes.INTEGER,
    },
    github_created_at: {
      type: DataTypes.STRING,
    },
    github_updated_at: {
      type: DataTypes.STRING,
    },
    private_gists: {
      type: DataTypes.INTEGER,
    },
    total_private_repos: {
      type: DataTypes.INTEGER,
    },
    owned_private_repos: {
      type: DataTypes.INTEGER,
    },
    disk_usage: {
      type: DataTypes.INTEGER,
    },
    collaborators: {
      type: DataTypes.INTEGER,
    },
    two_factor_authentication: {
      type: DataTypes.STRING,
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
