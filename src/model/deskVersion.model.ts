import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IDeskVersion } from '@/interface';

interface DeskVersionModel
  extends Model<
      InferAttributes<DeskVersionModel>,
      InferCreationAttributes<DeskVersionModel>
    >,
    IDeskVersion {}

const model = sequelize.define<DeskVersionModel>(
  'desk_version',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    force: {
      type: DataTypes.INTEGER,
    },
    version: {
      type: DataTypes.STRING(100),
    },
    show_version: {
      type: DataTypes.STRING(100),
    },
    update_content: {
      type: DataTypes.STRING(500),
    },
    update_date: {
      type: DataTypes.STRING(100),
    },
    disable: {
      type: DataTypes.INTEGER,
    },
    disable_msg: {
      type: DataTypes.STRING(500),
    },
    download_macos_dmg: {
      type: DataTypes.STRING(500),
    },
    download_windows_64_exe: {
      type: DataTypes.STRING(500),
    },
    download_windows_32_exe: {
      type: DataTypes.STRING(500),
    },
    download_windows_arm_exe: {
      type: DataTypes.STRING(500),
    },
    download_linux_64_deb: {
      type: DataTypes.STRING(500),
    },
    download_linux_64_tar: {
      type: DataTypes.STRING(500),
    },
    download_linux_arm_deb: {
      type: DataTypes.STRING(500),
    },
    download_linux_arm_tar: {
      type: DataTypes.STRING(500),
    },
    remark: {
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

initTable({ model, sequelize });

export default model;
