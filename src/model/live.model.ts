import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { ILive } from '@/interface';

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
    socket_id: {
      type: DataTypes.STRING(100),
    },
    live_room_id: {
      type: DataTypes.INTEGER,
    },
    track_video: {
      type: DataTypes.INTEGER,
    },
    track_audio: {
      type: DataTypes.INTEGER,
    },
    srs_server_id: {
      type: DataTypes.STRING,
    },
    srs_service_id: {
      type: DataTypes.STRING,
    },
    srs_action: {
      type: DataTypes.STRING,
    },
    srs_client_id: {
      type: DataTypes.STRING,
    },
    srs_ip: {
      type: DataTypes.STRING(500),
    },
    srs_vhost: {
      type: DataTypes.STRING,
    },
    srs_app: {
      type: DataTypes.STRING,
    },
    srs_tcUrl: {
      type: DataTypes.STRING,
    },
    srs_stream: {
      type: DataTypes.STRING,
    },
    srs_param: {
      type: DataTypes.STRING,
    },
    srs_stream_url: {
      type: DataTypes.STRING,
    },
    srs_stream_id: {
      type: DataTypes.STRING,
    },
    is_tencentcloud_css: {
      type: DataTypes.INTEGER,
    },
    flag_id: {
      type: DataTypes.STRING,
    },
    // ddd: {
    //   type: DataTypes.STRING,
    // },
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
