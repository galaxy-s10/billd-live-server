import fs from 'fs';

// eslint-disable-next-line import/order
import {
  SECRETTEMP_FILE,
  SECRET_FILE,
  STATIC_DIR,
  UPLOAD_DIR,
} from '../constant';

export function handleSecretFile() {
  const isExist = fs.existsSync(SECRET_FILE);
  if (!isExist) {
    const secretTemp = fs.readFileSync(SECRETTEMP_FILE);
    fs.writeFileSync(SECRET_FILE, secretTemp.toString());
  }
}

export function handleStaticDir() {
  const isExist = fs.existsSync(STATIC_DIR);
  if (!isExist) {
    fs.mkdirSync(STATIC_DIR);
  }
}

export function handleUploadDir() {
  const isExist = fs.existsSync(UPLOAD_DIR);
  if (!isExist) {
    fs.mkdirSync(UPLOAD_DIR);
  }
}

handleSecretFile(); // 处理秘钥文件(src.config/secret.ts)
handleUploadDir(); // 处理文件上传目录(src/upload)
handleStaticDir(); // 处理静态文件目录(src/public)
