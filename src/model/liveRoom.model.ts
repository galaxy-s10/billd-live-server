import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { ILiveRoom } from '@/types/ILiveRoom';

interface LiveRoomModel
  extends Model<
      InferAttributes<LiveRoomModel>,
      InferCreationAttributes<LiveRoomModel>
    >,
    ILiveRoom {}

const model = sequelize.define<LiveRoomModel>(
  'live_room',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
    },
    desc: {
      type: DataTypes.STRING(300),
    },
    status: {
      type: DataTypes.INTEGER,
    },
    is_show: {
      type: DataTypes.INTEGER,
    },
    remark: {
      type: DataTypes.STRING(500),
    },
    key: {
      type: DataTypes.STRING(100),
    },
    type: {
      type: DataTypes.INTEGER,
    },
    pull_is_should_auth: {
      type: DataTypes.INTEGER,
    },
    cdn: {
      type: DataTypes.INTEGER,
    },
    weight: {
      type: DataTypes.INTEGER,
    },
    cover_img: {
      type: DataTypes.STRING(200),
    },
    bg_img: {
      type: DataTypes.STRING(200),
    },
    rtmp_url: {
      type: DataTypes.STRING(200),
    },
    flv_url: {
      type: DataTypes.STRING(200),
    },
    hls_url: {
      type: DataTypes.STRING(200),
    },
    webrtc_url: {
      type: DataTypes.STRING(200),
    },
    push_rtmp_url: {
      type: DataTypes.STRING(200),
    },
    push_obs_server: {
      type: DataTypes.STRING(200),
    },
    push_obs_stream_key: {
      type: DataTypes.STRING(200),
    },
    push_webrtc_url: {
      type: DataTypes.STRING(200),
    },
    push_srt_url: {
      type: DataTypes.STRING(200),
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
