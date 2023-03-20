import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IMonit } from '@/interface';
import { initTable } from '@/utils';

interface MonitModel
  extends Model<
      InferAttributes<MonitModel>,
      InferCreationAttributes<MonitModel>
    >,
    IMonit {}

const model = sequelize.define<MonitModel>(
  'monit',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.INTEGER,
    },
    info: {
      type: DataTypes.TEXT,
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
