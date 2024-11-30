import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IConfig } from '@/interface';

interface ConfigModel
  extends Model<
      InferAttributes<ConfigModel>,
      InferCreationAttributes<ConfigModel>
    >,
    IConfig {}

const model = sequelize.define<ConfigModel>(
  'config',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    field_a: {
      type: DataTypes.TEXT,
    },
    field_b: {
      type: DataTypes.TEXT,
    },
    field_c: {
      type: DataTypes.TEXT,
    },
    field_d: {
      type: DataTypes.TEXT,
    },
    field_e: {
      type: DataTypes.TEXT,
    },
    field_f: {
      type: DataTypes.TEXT,
    },
    field_g: {
      type: DataTypes.TEXT,
    },
    remark: {
      type: DataTypes.STRING(500),
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
