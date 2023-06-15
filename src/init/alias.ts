import path from 'path';

import moduleAlias from 'module-alias';

import { PROJECT_ENV_ENUM, PROJECT_NODE_ENV } from '../constant';
import { chalkSUCCESS } from '../utils/chalkTip';

if (PROJECT_NODE_ENV === PROJECT_ENV_ENUM.development) {
  moduleAlias.addAlias('@', path.join(process.cwd(), 'src'));
} else {
  moduleAlias.addAlias('@', path.join(process.cwd(), 'dist'));
}

console.log(chalkSUCCESS('添加路径别名成功！'));
