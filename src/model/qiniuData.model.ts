import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IQiniuData } from '@/interface';

interface QiniuDataModel
  extends Model<
      InferAttributes<QiniuDataModel>,
      InferCreationAttributes<QiniuDataModel>
    >,
    IQiniuData {}

const model = sequelize.define<QiniuDataModel>(
  'qiniu_data',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    prefix: {
      type: DataTypes.STRING(50),
    },
    bucket: {
      type: DataTypes.STRING(50),
    },
    qiniu_key: {
      type: DataTypes.STRING(150),
    },
    qiniu_hash: {
      type: DataTypes.STRING(50),
    },
    qiniu_fsize: {
      type: DataTypes.STRING(50),
    },
    qiniu_mimeType: {
      type: DataTypes.STRING(50),
    },
    qiniu_putTime: {
      // 会返回：16511776862952760，超出DataTypes.INTEGER大小，可以使用DataTypes.BIGINT
      type: DataTypes.STRING(50),
    },
    qiniu_type: {
      type: DataTypes.STRING(50),
    },
    qiniu_status: {
      type: DataTypes.STRING(50),
    },
    qiniu_md5: {
      type: DataTypes.STRING(50),
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
