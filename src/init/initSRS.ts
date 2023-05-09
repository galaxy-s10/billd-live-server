import { execSync } from 'child_process';
import path from 'path';

import { chalkSUCCESS } from '@/utils/chalkTip';

export const initSRS = () => {
  try {
    const srsSh = `sh ${path.resolve(process.cwd(), 'srs.sh')}`;
    // const srsSh = `echo ${path.resolve(process.cwd(), 'srs.sh')}`;
    execSync(srsSh);
    console.log(chalkSUCCESS(`${new Date().toLocaleString()},初始化SRS成功！`));
    // const child = exec(srsSh, {}, (error, stdout, stderr) => {
    //   console.log(
    //     chalkSUCCESS(`${new Date().toLocaleString()},初始化SRS成功！`)
    //   );
    //   console.log('error', error);
    //   console.log('stdout', stdout);
    //   console.log('stderr', stderr);
    // });
    // child.on('exit', () => {
    //   console.log(
    //     chalkINFO(`${new Date().toLocaleString()},initSRS子进程退出了,${srsSh}`)
    //   );
    // });
    // child.on('error', () => {
    //   console.log(
    //     chalkERROR(`${new Date().toLocaleString()},initSRS子进程错误,${srsSh}`)
    //   );
    // });
  } catch (error) {
    console.log(error);
  }
};
