import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IDeskConfig } from '@/interface';

interface DeskConfigModel
  extends Model<
      InferAttributes<DeskConfigModel>,
      InferCreationAttributes<DeskConfigModel>
    >,
    IDeskConfig {}

const model = sequelize.define<DeskConfigModel>(
  'desk_config',
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
