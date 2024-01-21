import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IQqUser } from '@/types/IUser';

interface QqUserModel
  extends Model<
      InferAttributes<QqUserModel>,
      InferCreationAttributes<QqUserModel>
    >,
    IQqUser {}

const model = sequelize.define<QqUserModel>(
  'qq_user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    client_id: {
      // 其实就是appid
      type: DataTypes.STRING,
    },
    openid: {
      type: DataTypes.STRING,
    },
    unionid: {
      type: DataTypes.STRING,
    },
    // https://wiki.connect.qq.com/%E4%BD%BF%E7%94%A8authorization_code%E8%8E%B7%E5%8F%96access_token
    // access_token: {
    //   type: DataTypes.TEXT('long'),
    // },
    // expires_in: {
    //   // 该access token的有效期，单位为秒。
    //   type: DataTypes.STRING,
    // },
    // refresh_token: {
    //   type: DataTypes.TEXT('long'),
    // },
    nickname: {
      type: DataTypes.STRING,
    },
    figureurl: {
      // 大小为30×30像素的QQ空间头像URL。
      type: DataTypes.STRING,
    },
    figureurl_1: {
      // 大小为50×50像素的QQ空间头像URL。
      type: DataTypes.STRING,
    },
    figureurl_2: {
      // 大小为100×100像素的QQ空间头像URL。
      type: DataTypes.STRING,
    },
    figureurl_qq_1: {
      // 大小为40×40像素的QQ头像URL。
      type: DataTypes.STRING,
    },
    figureurl_qq_2: {
      // 大小为100×100像素的QQ头像URL。需要注意，不是所有的用户都拥有QQ的100x100的头像，但40x40像素则是一定会有
      type: DataTypes.STRING,
    },
    constellation: {
      // 星座
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    province: {
      type: DataTypes.STRING,
    },
    year: {
      type: DataTypes.STRING,
    },
  },
  {
    indexes: [
      {
        name: 'client_id',
        fields: ['client_id'],
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
