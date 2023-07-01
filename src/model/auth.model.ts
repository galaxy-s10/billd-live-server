import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { initTable } from '@/init/initDb';
import { IAuth } from '@/interface';

interface AuthModel
  extends Model<InferAttributes<AuthModel>, InferCreationAttributes<AuthModel>>,
    IAuth {}

const model = sequelize.define<AuthModel>(
  'auth',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    auth_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    auth_value: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    type: {
      type: DataTypes.INTEGER, // 1：默认，2：自定义
    },
    priority: {
      type: DataTypes.INTEGER,
    },
    p_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    hooks: {
      /**
       * 诸如 bulkCreate, update 和 destroy 之类的方法一次编辑多个记录会触发:
       * beforeBulkCreate
       * beforeBulkUpdate
       * beforeBulkDestroy
       * afterBulkCreate
       * afterBulkUpdate
       * afterBulkDestroy
       * 默认情况下,类似 bulkCreate 的方法不会触发单独的 hook - 仅会触发批量 hook.（因为可能where的时候可能会改了几条记录） 但是,如果你还希望触发单个 hook,则可以将 { individualHooks: true }
       * 即如果destroy的话,不会触发afterDestroy,beforeDestroy等hooks，如果希望destroy触发单个hook的话，需要添加{ individualHooks: true }
       */
      afterDestroy() {
        // beforeDestroy 和 afterDestroy hook 只会在具有 onDelete: 'CASCADE' 和 hooks: true 的关联上被调用.
        console.log('afterDestroy');
        // @ts-ignore
        // const item = await instance.getAuth();
        // item && item.destroy();
      },
      afterBulkDestroy() {
        console.log('afterBulkDestroy');
      },
      afterBulkUpdate() {
        console.log('afterBulkUpdate');
      },
    },
    indexes: [
      {
        name: 'p_id',
        fields: ['p_id'],
      },
    ],
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable({ model, sequelize });
export default model;
