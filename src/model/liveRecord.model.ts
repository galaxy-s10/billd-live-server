import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { ILiveRecord } from '@/interface';

interface LiveRecordModel
  extends Model<
      InferAttributes<LiveRecordModel>,
      InferCreationAttributes<LiveRecordModel>
    >,
    ILiveRecord {}

const model = sequelize.define<LiveRecordModel>(
  'live_record',
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
    client_id: {
      type: DataTypes.STRING,
    },
    duration: {
      type: DataTypes.INTEGER,
    },
    danmu: {
      type: DataTypes.INTEGER,
    },
    view: {
      type: DataTypes.INTEGER,
    },
    end_time: {
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
