import fs from 'fs';

// eslint-disable-next-line import/order
import {
  SECRET_BETA_FILE,
  SECRET_DEV_FILE,
  SECRET_PROD_FILE,
  SECRET_TEMPLATE_FILE,
  STATIC_DIR,
  UPLOAD_DIR,
} from '../constant';

export function handleSecretFile() {
  const devFileIsExist = fs.existsSync(SECRET_DEV_FILE);
  if (!devFileIsExist) {
    const secretTemp = fs.readFileSync(SECRET_TEMPLATE_FILE);
    fs.writeFileSync(SECRET_DEV_FILE, secretTemp.toString());
  }
  const betaFileIsExist = fs.existsSync(SECRET_BETA_FILE);
  if (!betaFileIsExist) {
    const secretTemp = fs.readFileSync(SECRET_TEMPLATE_FILE);
    fs.writeFileSync(SECRET_BETA_FILE, secretTemp.toString());
  }
  const prodFileIsExist = fs.existsSync(SECRET_PROD_FILE);
  if (!prodFileIsExist) {
    const secretTemp = fs.readFileSync(SECRET_TEMPLATE_FILE);
    fs.writeFileSync(SECRET_PROD_FILE, secretTemp.toString());
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
