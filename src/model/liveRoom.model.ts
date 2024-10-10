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
    priority: {
      type: DataTypes.INTEGER,
    },
    cover_img: {
      type: DataTypes.STRING(200),
    },
    bg_img: {
      type: DataTypes.STRING(200),
    },
    rtmp_url: {
      type: DataTypes.STRING(500),
    },
    flv_url: {
      type: DataTypes.STRING(500),
    },
    hls_url: {
      type: DataTypes.STRING(500),
    },
    webrtc_url: {
      type: DataTypes.STRING(500),
    },
    push_rtmp_url: {
      type: DataTypes.STRING(500),
    },
    push_obs_server: {
      type: DataTypes.STRING(500),
    },
    push_obs_stream_key: {
      type: DataTypes.STRING(500),
    },
    push_webrtc_url: {
      type: DataTypes.STRING(500),
    },
    push_srt_url: {
      type: DataTypes.STRING(500),
    },
    cdn_rtmp_url: {
      type: DataTypes.STRING(500),
    },
    cdn_flv_url: {
      type: DataTypes.STRING(500),
    },
    cdn_hls_url: {
      type: DataTypes.STRING(500),
    },
    cdn_webrtc_url: {
      type: DataTypes.STRING(500),
    },
    cdn_push_rtmp_url: {
      type: DataTypes.STRING(500),
    },
    cdn_push_obs_server: {
      type: DataTypes.STRING(500),
    },
    cdn_push_obs_stream_key: {
      type: DataTypes.STRING(500),
    },
    cdn_push_webrtc_url: {
      type: DataTypes.STRING(500),
    },
    cdn_push_srt_url: {
      type: DataTypes.STRING(500),
    },
    forward_bilibili_url: {
      type: DataTypes.STRING(500),
    },
    forward_huya_url: {
      type: DataTypes.STRING(500),
    },
    forward_douyu_url: {
      type: DataTypes.STRING(500),
    },
    forward_douyin_url: {
      type: DataTypes.STRING(500),
    },
    forward_kuaishou_url: {
      type: DataTypes.STRING(500),
    },
    forward_xiaohongshu_url: {
      type: DataTypes.STRING(500),
    },
    is_fake: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
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
