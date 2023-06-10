import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { ILive } from '@/interface';
import { initTable } from '@/utils';

interface LiveModel
  extends Model<InferAttributes<LiveModel>, InferCreationAttributes<LiveModel>>,
    ILive {}

const model = sequelize.define<LiveModel>(
  'live',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    system: {
      // 1:系统直播;2:用户直播
      type: DataTypes.INTEGER,
      defaultValue: 2,
    },
    socketId: {
      type: DataTypes.STRING(100),
    },
    live_room_id: {
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    track_video: {
      type: DataTypes.BOOLEAN,
    },
    track_audio: {
      type: DataTypes.BOOLEAN,
    },
    coverImg: {
      type: DataTypes.TEXT,
    },
    streamurl: {
      type: DataTypes.STRING(100),
    },
    flvurl: {
      type: DataTypes.STRING(100),
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

initTable({ model, sequelize });

export default model;
