import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import {
  ILiveRoom,
  LiveRoomIsShowEnum,
  LiveRoomStatusEnum,
} from '@/types/ILiveRoom';

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
      defaultValue: '',
    },
    desc: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: LiveRoomStatusEnum.normal,
    },
    is_show: {
      type: DataTypes.INTEGER,
      defaultValue: LiveRoomIsShowEnum.yes,
    },
    remark: {
      type: DataTypes.STRING(500),
      defaultValue: '',
    },
    key: {
      type: DataTypes.STRING(100),
      defaultValue: '',
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
      defaultValue: '',
    },
    bg_img: {
      type: DataTypes.STRING(200),
      defaultValue: '',
    },
    rtmp_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    flv_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    hls_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    webrtc_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    push_rtmp_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    push_obs_server: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    push_obs_stream_key: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    push_webrtc_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    push_srt_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    cdn_rtmp_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    cdn_flv_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    cdn_hls_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    cdn_webrtc_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    cdn_push_rtmp_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    cdn_push_obs_server: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    cdn_push_obs_stream_key: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    cdn_push_webrtc_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    cdn_push_srt_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    forward_bilibili_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    forward_huya_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    forward_douyu_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    forward_douyin_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    forward_kuaishou_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
    },
    forward_xiaohongshu_url: {
      type: DataTypes.STRING(300),
      defaultValue: '',
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
