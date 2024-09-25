import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { ILivePlay } from '@/interface';

interface LivePlayModel
  extends Model<
      InferAttributes<LivePlayModel>,
      InferCreationAttributes<LivePlayModel>
    >,
    ILivePlay {}

const model = sequelize.define<LivePlayModel>(
  'live_play',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    live_room_id: {
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    random_id: {
      type: DataTypes.STRING,
    },
    end_time: {
      type: DataTypes.STRING,
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
