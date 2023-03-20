import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IMusic } from '@/interface';
import { initTable } from '@/utils';

interface MusicModel
  extends Model<
      InferAttributes<MusicModel>,
      InferCreationAttributes<MusicModel>
    >,
    IMusic {}

const model = sequelize.define<MusicModel>(
  'music',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
    },
    cover_pic: {
      type: DataTypes.STRING(150),
    },
    author: {
      type: DataTypes.STRING(50),
    },
    audio_url: {
      type: DataTypes.STRING(150),
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 2, // 1:已审核 2:未审核
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
