import { exec } from 'child_process';

import srsController from '@/controller/srs.controller';
import { IApiV1Streams } from '@/interface-srs';
import { chalkWARN } from '@/utils/chalkTip';

// WARN 执行ffmpeg命令返回信息，但不会返回code 0退出，都是非0 code退出
function executeCommandWithTimeout(command, timeout) {
  return new Promise((resolve, reject) => {
    const childProcess = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });

    const timeoutId = setTimeout(() => {
      childProcess.kill();
      reject(new Error('子进程超时，终止子进程'));
    }, timeout);

    childProcess.on('exit', () => {
      clearTimeout(timeoutId);
    });
  });
}

async function verifyBitrateIsOver(info: IApiV1Streams['streams'][0]) {
  try {
    await executeCommandWithTimeout(
      `ffmpeg -i rtmp://localhost/livestream/${info.name}`,
      5000
    );
  } catch (error: any) {
    const errStr = error.message ? String(error.message) : '';
    const res = errStr.match(/bitrate: (.+) kb\/s/);
    if (res) {
      const bitrate = Number(res[1]);
      console.log(
        chalkWARN(
          `流名称：${info.name}，当前码率：${res[0]}，kbps（recv_30s）：${info.kbps.recv_30s}，kbps（send_30s）：${info.kbps.send_30s}，`
        )
      );
      if (bitrate > 1024 * 3) {
        // 码率超过3m，踢掉
        srsController.common.deleteApiV1Clients(info.publish.cid);
      }
    }
  }
}

export const handleVerifyStream = async () => {
  const res = await srsController.common.getApiV1Streams();

  res.streams.forEach((item) => {
    // verifyBitrateIsOver(item);
    if (item.kbps.recv_30s > 1024 * 4) {
      srsController.common.deleteApiV1Clients(item.publish.cid);
    }
  });
};
