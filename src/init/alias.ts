import path from 'path';

import moduleAlias from 'module-alias';

import { PROJECT_ENV, PROJECT_ENV_ENUM } from '../constant';
import { chalkSUCCESS } from '../utils/chalkTip';

if (PROJECT_ENV === PROJECT_ENV_ENUM.prod) {
  moduleAlias.addAlias('@', path.join(process.cwd(), 'dist'));
} else {
  moduleAlias.addAlias('@', path.join(process.cwd(), 'src'));
}

console.log(chalkSUCCESS('添加路径别名成功！'));
