import { exec, execSync } from 'child_process';

import { SRS_CB_URL_PARAMS } from '@/constant';

/** 杀死所有ffmpeg进程 */
export function killAllFFmpeg() {
  // 查看所有ffmpeg进程：ps aux | grep ffmpeg | grep -v grep | awk '{print $2}'
  // 杀死所有ffmpeg进程：kill -9 `ps aux | grep ffmpeg | grep -v grep | awk '{print $2}'`
  const cmd = `kill -9 \`ps aux | grep ffmpeg | grep -v grep | awk '{print $2}'\``;
  exec(cmd);
}

export function showOneFFmpegPid(rtmpUrl: string) {
  // 查看所有ffmpeg进程：ps aux | grep ffmpeg | grep -v grep | awk '{print $2}'
  // 杀死所有ffmpeg进程：kill -9 `ps aux | grep ffmpeg | grep -v grep | awk '{print $2}'`
  const cmd = `ps aux | grep ${rtmpUrl} | grep -v grep | awk '{print $2}'`;
  exec(cmd, (err, stdout, stderr) => {
    console.log('showOneFFmpegPid', cmd);
    console.log(err, stdout, stderr);
  });
}

export function mp4PushRtmp(data: {
  txt: string;
  rtmpUrl: string;
  token: string;
}) {
  const cmd = `ffmpeg -threads 1 -readrate 1 -f concat -safe 0 -i '${data.txt}' -vcodec copy -acodec copy -f flv '${data.rtmpUrl}?${SRS_CB_URL_PARAMS.publishKey}=${data.token}'`;
  // const cmd = `ffmpeg -threads 1 -readrate 1 -f concat -safe 0 -i '${data.txt}' -vcodec h264 -acodec aac -f flv '${data.rtmpUrl}?${SRS_CB_URL_PARAMS.publishKey}=${data.token}'`;
  exec(cmd, (err, stdout, stderr) => {
    console.log('mp4PushRtmp', cmd);
    // console.log(err, stdout, stderr);
  });
}

export function webmToMp4(data: { input: string; output: string }) {
  // -y 选项用于强制覆盖目标文件
  const cmd = `ffmpeg -y -i ${data.input} -vcodec copy -acodec aac ${data.output}`;
  // const cmd = `ffmpeg -i ${data.input} -vcodec copy -an ${data.output}`;
  // console.log(cmd, 'webmToMp4');
  try {
    execSync(cmd, { stdio: 'ignore' });
    // console.log(new Date().toLocaleString(), '转码成功', data.input);
    return true;
  } catch (error: any) {
    // console.log(new Date().toLocaleString(), '转码失败', data.input);
    console.error('命令:', cmd);
    console.error('命令执行失败:', error.status);
    console.error('标准输出:', error.stdout);
    console.error('标准错误:', error.stderr);
    return false;
  }
}

export function concatMp4(data: { input: string; output: string }) {
  const cmd = `ffmpeg -f concat -safe 0 -i ${data.input} -c copy ${data.output}`;
  // console.log(cmd, 'concatMp4');
  try {
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch (error: any) {
    console.error('命令:', cmd);
    console.error('命令执行失败:', error.status);
    console.error('标准输出:', error.stdout);
    console.error('标准错误:', error.stderr);
    return false;
  }
}
