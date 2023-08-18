import fs from 'fs';

import { Sequelize } from 'sequelize';
import { Model, ModelStatic } from 'sequelize/types';

// import sequelize from '@/config/mysql';
import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/utils/chalkTip';

/** 删除所有外键 */
export const deleteAllForeignKeys = async (sequelize: Sequelize) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const allTables: string[] = await queryInterface.showAllTables();
    console.log(chalkINFO(`所有表:${allTables.toString()}`));
    const allConstraint: any = [];
    allTables.forEach((v) => {
      allConstraint.push(queryInterface.getForeignKeysForTables([v]));
    });
    const res1 = await Promise.all(allConstraint);
    const allConstraint1: any = [];
    res1.forEach((v) => {
      const tableName = Object.keys(v)[0];
      const constraint: string[] = v[tableName];
      constraint.forEach((item) => {
        allConstraint1.push(queryInterface.removeConstraint(tableName, item));
      });
      console.log(
        chalkINFO(`当前${tableName}表的外键: ${constraint.toString()}`)
      );
    });
    await Promise.all(allConstraint1);
    console.log(chalkSUCCESS('删除所有外键成功！'));
  } catch (err) {
    console.log(chalkERROR('删除所有外键失败！'), err);
  }
};

/** 删除所有索引（除了PRIMARY） */
export const deleteAllIndexs = async (sequelize: Sequelize) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const allTables = await queryInterface.showAllTables();
    console.log(chalkINFO(`所有表:${allTables.toString()}`));
    const allIndexs: any = [];
    allTables.forEach((v) => {
      allIndexs.push(queryInterface.showIndex(v));
    });
    const res1 = await Promise.all(allIndexs);
    const allIndexs1: any = [];
    res1.forEach((v: any[]) => {
      const { tableName }: { tableName: string } = v[0];
      const indexStrArr: string[] = [];
      v.forEach((x) => {
        indexStrArr.push(x.name);
        if (x.name !== 'PRIMARY') {
          allIndexs1.push(queryInterface.removeIndex(tableName, x.name));
        }
      });
      console.log(
        chalkINFO(`当前${tableName}表的索引: ${indexStrArr.toString()}`)
      );
    });
    await Promise.all(allIndexs1);
    console.log(chalkSUCCESS('删除所有索引成功！'));
  } catch (err) {
    console.log(chalkERROR('删除所有索引失败！'), err);
  }
};

/**
 * 初始化表
 * @param model
 * @param method
 */
export const initTable = (data: {
  model: ModelStatic<Model>;
  method?: 'force' | 'alter';
  sequelize: Sequelize;
}) => {
  async function main(
    modelArg: ModelStatic<Model>,
    methodArg?: 'force' | 'alter'
  ) {
    if (methodArg === 'force') {
      await deleteAllIndexs(data.sequelize);
      await deleteAllForeignKeys(data.sequelize);
      await modelArg.sync({ force: true });
      console.log(chalkSUCCESS(`${modelArg.tableName}表刚刚(重新)创建！`));
    } else if (methodArg === 'alter') {
      await deleteAllIndexs(data.sequelize);
      await deleteAllForeignKeys(data.sequelize);
      await modelArg.sync({ alter: true });
      console.log(chalkSUCCESS(`${modelArg.tableName}表刚刚同步成功！`));
    } else {
      console.log(chalkINFO(`加载数据库表: ${modelArg.tableName}`));
    }
  }
  main(data.model, data.method).catch((err) => {
    console.log(chalkERROR(`initTable失败`), err.message);
    console.log(err);
  });
};

/** 加载所有model */
export const loadAllModel = () => {
  const modelDir = `${process.cwd()}/${
    PROJECT_ENV === PROJECT_ENV_ENUM.prod ? 'dist' : 'src'
  }/model`;
  fs.readdirSync(modelDir).forEach((file: string) => {
    if (PROJECT_ENV === PROJECT_ENV_ENUM.development) {
      if (file.indexOf('.model.ts') === -1) return;
    } else if (file.indexOf('.model.js') === -1) return;
    // eslint-disable-next-line
    require(`${modelDir}/${file}`).default;
  });
  console.log(chalkSUCCESS(`加载所有数据库表成功!`));
};

/** 删除所有表 */
export const deleteAllTable = async (sequelize: Sequelize) => {
  try {
    loadAllModel();
    await sequelize.drop();
    console.log(chalkSUCCESS('删除所有表成功！'));
  } catch (err) {
    console.log(chalkERROR('删除所有表失败！'));
  }
};

/**
 * 初始化数据库：
 * force:重置所有
 * alert:校正现有数据库
 * load:加载数据库表
 */
export const initDb = async (
  type: 'force' | 'alert' | 'load',
  sequelize: Sequelize
) => {
  switch (type) {
    case 'force':
      await deleteAllForeignKeys(sequelize);
      await deleteAllIndexs(sequelize);
      await deleteAllTable(sequelize);
      await sequelize.sync({ force: true }); // 将创建表,如果表已经存在,则将其首先删除
      console.log(chalkSUCCESS('初始化数据库所有表完成！'));
      break;
    case 'alert':
      require('@/model/relation');
      await sequelize.sync({ alter: true }); // 这将检查数据库中表的当前状态(它具有哪些列,它们的数据类型等),然后在表中进行必要的更改以使其与模型匹配.
      console.log(chalkSUCCESS('校正数据库所有表完成！'));
      break;
    case 'load':
      require('@/model/relation');
      break;
    default:
      throw new Error('initDb参数不正确！');
  }
};
