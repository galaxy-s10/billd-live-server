import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { ILiveRoom } from '@/interface';
import { initTable } from '@/utils';

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
    roomName: {
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

initTable(model);
export default model;
