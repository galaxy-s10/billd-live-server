import { Sequelize } from 'sequelize';

import { initDb, loadAllModel } from '@/init/initDb';
import { MYSQL_CONFIG } from '@/secret/secret';
import { chalkINFO, chalkSUCCESS } from '@/utils/chalkTip';

export const dbName = MYSQL_CONFIG.database;

export function newSequelize(db?) {
  return new Sequelize({
    database: db,
    username: MYSQL_CONFIG.username,
    password: MYSQL_CONFIG.password,
    host: MYSQL_CONFIG.host,
    port: MYSQL_CONFIG.port,
    dialect: 'mysql',
    dialectOptions: {
      // 返回正确的时间戳字符串。
      dateStrings: true,
      typeCast: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '+08:00',
    // logging: true,
    logging: false,
  });
}

const msg = (flag: boolean) =>
  `连接${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}服务器的${dbName}数据库${
    flag ? '成功' : '失败'
  }!`;

const sequelize = newSequelize(dbName);

async function createDb() {
  const initSequelize = newSequelize();
  await initSequelize.query(
    `CREATE DATABASE ${dbName} CHARACTER SET = 'utf8mb4';`,
    { logging: false }
  );
  console.log(chalkSUCCESS(`新建${dbName}数据库成功！`));
  await initDb('alter', sequelize);
  await initSequelize.close();
}

/** 连接数据库 */
export const connectMysql = async (init = false) => {
  console.log(
    chalkINFO(
      `开始连接${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}服务器的${dbName}数据库...`
    )
  );
  if (init) {
    await createDb();
    loadAllModel();
    require('@/model/relation');
    await initDb('force', sequelize);
    return;
  }
  await sequelize.authenticate({ logging: false });
  loadAllModel();
  require('@/model/relation');
  // await initDb('alter-1', sequelize);
  // await initDb('alter', sequelize);
  // await initDb('force', sequelize);
  // await (
  //   await import('../../controller/init.controller')
  // ).default.common.initDefault();
  console.log(chalkSUCCESS(msg(true)));
};

export default sequelize;
