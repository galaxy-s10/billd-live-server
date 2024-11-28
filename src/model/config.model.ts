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
      type: DataTypes.STRING(500),
    },
    field_b: {
      type: DataTypes.STRING(500),
    },
    field_c: {
      type: DataTypes.STRING(500),
    },
    field_d: {
      type: DataTypes.STRING(500),
    },
    field_e: {
      type: DataTypes.STRING(500),
    },
    field_f: {
      type: DataTypes.STRING(500),
    },
    field_g: {
      type: DataTypes.STRING(500),
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
