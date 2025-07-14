// https://github.com/demopark/sequelize-docs-Zh-CN/blob/master/core-concepts/model-basics.md#%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
// import userService from '@/service/user.service';
import { IUser } from '@/interface';
import { initTable } from '@/utils';
// const MD5 = require('crypto-js/md5');

interface UserModel
  extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>>,
    IUser {}

const model = sequelize.define<UserModel>(
  'user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    // uuid: {
    //   type: DataTypes.UUID,
    //   defaultValue: DataTypes.UUIDV4, // 或 Sequelize.UUIDV1
    // },
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
      // unique: true,
      // unique: {
      //   name: '???',
      //   msg: '存在同名用户！',
      // },
      validate: {
        // 其实不管isUnique叫啥名字，都会执行。
        // 如果验证是异步的，则需要添加第二个参数done，在验证结束后执行done回调
        // async isUnique(username, done) {
        //   const isSameName = await userService.isSameName(username);
        //   if (isSameName) {
        //     done(new Error('已存在同名用户！'));
        //   } else {
        //     done();
        //   }
        // },
      },
    },
    password: {
      type: DataTypes.STRING(50),
      allowNull: false,
      // validate: {
      //   /**
      //    * 不匹配[0-9]+$,即不匹配从头到尾都是数字
      //    * 不匹配[a-zA-Z]+$，即不匹配从头到尾都是字母
      //    * 不匹配[_]+$，即不匹配从头到尾都是下划线
      //    * 匹配[0-9a-zA-Z_]{8,16}，即只匹配数字或字母或下划线，最少8个最多16个
      //    * 总结：只匹配8到16位的数字或字母或下划线，且不能全是数字/字母/下划线
      //    */
      //   // is: /(?![0-9]+$)(?![a-zA-Z]+$)[0-9a-zA-A]{8,16}/g,
      //   regPwd(value: string) {
      //     const reg = /(?![0-9]+$)(?![a-zA-Z]+$)(?![_]+$)[0-9a-zA-A_]{8,16}/g;
      //     if (!reg.test(value)) {
      //       throw new Error('密码格式错误！');
      //     }
      //   },
      // },
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1:正常 2:禁用
    },
    avatar: {
      type: DataTypes.STRING(150),
    },
    desc: {
      type: DataTypes.STRING(50),
      defaultValue: '这个人很懒，什么也没有留下',
    },
    token: {
      type: DataTypes.TEXT,
    },
  },
  {
    hooks: {
      // https://github.com/demopark/sequelize-docs-Zh-CN/blob/master/other-topics/hooks.md
      // afterValidate(instance: any) {
      //   if (instance.changed('password')) {
      //     // eslint-disable-next-line no-param-reassign
      //     instance.password = MD5(instance.password).toString();
      //   }
      // },
    },
    paranoid: true,
    // timestamps: false, // 将createdAt和updatedAt时间戳添加到模型中。默认为true。
    /**
     * 如果freezeTableName为true，sequelize将不会尝试更改DAO名称以获取表名。
     * 否则，dao名称将是复数的。默认为false。
     */
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable(model);
export default model;
