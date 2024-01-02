import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IMinuteData } from '@/interface';

interface MinuteFiveDataModel
  extends Model<
      InferAttributes<MinuteFiveDataModel>,
      InferCreationAttributes<MinuteFiveDataModel>
    >,
    IMinuteData {}

const model = sequelize.define<MinuteFiveDataModel>(
  'mock_minute_ten_data',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    minute: {
      type: DataTypes.DATE,
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
