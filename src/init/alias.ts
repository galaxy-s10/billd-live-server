import path from 'path';

import moduleAlias from 'module-alias';

import { PROJECT_NODE_ENV } from '../constant';
import { chalkSUCCESS } from '../utils/chalkTip';

if (PROJECT_NODE_ENV === 'development') {
  moduleAlias.addAlias('@', path.join(process.cwd(), 'src'));
} else {
  moduleAlias.addAlias('@', path.join(process.cwd(), 'dist'));
}

export const aliasOk = () => {
  console.log(chalkSUCCESS('添加路径别名成功！'));
};
