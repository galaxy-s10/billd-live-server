import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IAreaLiveRoom } from '@/interface';

interface AreaLiveRoomModel
  extends Model<
      InferAttributes<AreaLiveRoomModel>,
      InferCreationAttributes<AreaLiveRoomModel>
    >,
    IAreaLiveRoom {}

const model = sequelize.define<AreaLiveRoomModel>(
  'area_live_room',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    area_id: {
      type: DataTypes.INTEGER,
    },
    live_room_id: {
      type: DataTypes.INTEGER,
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
