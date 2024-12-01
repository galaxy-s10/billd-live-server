import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { SwitchEnum } from '@/interface';
import { ILiveRoom, LiveRoomStatusEnum } from '@/types/ILiveRoom';

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
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: LiveRoomStatusEnum.normal,
    },
    is_show: {
      type: DataTypes.INTEGER,
      defaultValue: SwitchEnum.yes,
    },
    remark: {
      type: DataTypes.STRING(100),
      defaultValue: '',
    },
    key: {
      type: DataTypes.STRING(50),
      defaultValue: '',
    },
    type: {
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
    pull_rtmp_url: {
      type: DataTypes.STRING(200),
      defaultValue: '',
    },
    pull_flv_url: {
      type: DataTypes.STRING(200),
      defaultValue: '',
    },
    pull_hls_url: {
      type: DataTypes.STRING(200),
      defaultValue: '',
    },
    pull_webrtc_url: {
      type: DataTypes.STRING(200),
      defaultValue: '',
    },
    pull_cdn_rtmp_url: {
      type: DataTypes.STRING(200),
      defaultValue: '',
    },
    pull_cdn_flv_url: {
      type: DataTypes.STRING(200),
      defaultValue: '',
    },
    pull_cdn_hls_url: {
      type: DataTypes.STRING(200),
      defaultValue: '',
    },
    pull_cdn_webrtc_url: {
      type: DataTypes.STRING(200),
      defaultValue: '',
    },
    push_cdn_rtmp_url: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    push_rtmp_url: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    push_obs_server: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    push_obs_stream_key: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    push_webrtc_url: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    push_srt_url: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    push_cdn_obs_server: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    push_cdn_obs_stream_key: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    push_cdn_webrtc_url: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    push_cdn_srt_url: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    forward_bilibili_url: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    forward_huya_url: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    forward_douyu_url: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    forward_douyin_url: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    forward_kuaishou_url: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    forward_xiaohongshu_url: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    is_fake: {
      type: DataTypes.INTEGER,
      defaultValue: SwitchEnum.no,
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
