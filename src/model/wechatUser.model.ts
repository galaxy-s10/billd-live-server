import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IWechatUser } from '@/types/IUser';

interface WechatUserModel
  extends Model<
      InferAttributes<WechatUserModel>,
      InferCreationAttributes<WechatUserModel>
    >,
    IWechatUser {}

const model = sequelize.define<WechatUserModel>(
  'wechat_user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    appid: {
      type: DataTypes.STRING,
    },
    openid: {
      type: DataTypes.STRING,
    },
    nickname: {
      type: DataTypes.STRING,
    },
    sex: {
      type: DataTypes.STRING,
    },
    province: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    headimgurl: {
      type: DataTypes.STRING,
    },
    privilege: {
      type: DataTypes.STRING,
    },
    unionid: {
      type: DataTypes.STRING,
    },
  },
  {
    indexes: [
      {
        name: 'appid',
        fields: ['appid'],
      },
      {
        name: 'openid',
        fields: ['openid'],
      },
      {
        name: 'unionid',
        fields: ['unionid'],
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
