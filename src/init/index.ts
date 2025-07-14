import fs from 'fs';

import { aliasOk } from './alias'; // 处理路径别名

// eslint-disable-next-line import/order
import { SECRETTEMP_FILE, SECRET_FILE, UPLOAD_DIR } from '../constant';

function handleSecretFile() {
  const isExist = fs.existsSync(SECRET_FILE);
  if (!isExist) {
    const secretTemp = fs.readFileSync(SECRETTEMP_FILE);
    fs.writeFileSync(SECRET_FILE, secretTemp.toString());
  }
}

function handleUploadDir() {
  const isExist = fs.existsSync(UPLOAD_DIR);
  if (!isExist) {
    fs.mkdirSync(UPLOAD_DIR);
  }
}
// 这个后面的代码才能用@别名
aliasOk();
handleSecretFile(); // 处理秘钥文件(src.config/secret.ts)
handleUploadDir(); // 处理文件上传目录(src/upload)
