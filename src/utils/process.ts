import { exec, execSync } from 'child_process';

import { PROJECT_ENV, PROJECT_ENV_ENUM, SRS_CB_URL_QUERY } from '@/constant';
import { BILIBILI_LIVE_PUSH_KEY, SRS_CONFIG, SRS_LIVE } from '@/secret/secret';
import { chalkERROR, chalkSUCCESS } from '@/utils/chalkTip';

export function pushToBilibili(flag = true) {
  let listFile = '/Users/huangshuisheng/Movies/Videos/list.txt';
  if (PROJECT_ENV === PROJECT_ENV_ENUM.prod) {
    listFile = '/node/video/list.txt';
  }
  const cmd = `ffmpeg -threads 1 -readrate 1 -stream_loop -1 -f concat -safe 0 -i '${listFile}' -vcodec h264 -acodec aac -f flv '${BILIBILI_LIVE_PUSH_KEY}'`;
  try {
    if (flag) {
      exec(cmd);
      console.log(chalkSUCCESS(`FFmpeg推流到bilibili成功`));
    }
  } catch (error) {
    console.log(chalkERROR(`FFmpeg推流到bilibili失败`));
    console.log(error);
  }
}

export function forwardToOtherPlatform({
  platform,
  localFlv,
  remoteRtmp,
}: {
  platform:
    | 'bilibili'
    | 'xiaohongshu'
    | 'kuaishou'
    | 'douyu'
    | 'douyin'
    | 'huya';
  localFlv: string;
  remoteRtmp: string;
}) {
  // const cmd = `ffmpeg -f flv -i '${localFlv}?forwardToOtherPlatform=${platform}' -c copy -f flv '${remoteRtmp}'`;
  let localFlvRes = localFlv;
  if (PROJECT_ENV === PROJECT_ENV_ENUM.prod) {
    localFlvRes = localFlv.replace(
      SRS_LIVE.PullDomain,
      `http://localhost:${SRS_CONFIG.docker.port[8080]}`
    );
  }
  const cmd = `ffmpeg -f flv -i '${localFlvRes}?forwardToOtherPlatform=${platform}' -c:v copy -c:a aac -f flv '${remoteRtmp}'`;
  // const cmd = `ffmpeg -f flv -i '${localFlv}?forwardToOtherPlatform=${platform}' -c copy -f flv 'rtmp://localhost/livestream/roomId___12?pushkey=159117a86318005a17e2c55ff318d998&pushtype=1'`;
  try {
    exec(cmd);
    console.log(cmd);
    console.log(chalkSUCCESS(`FFmpeg转推到${platform}成功`));
  } catch (error) {
    console.log(chalkERROR(`FFmpeg转推到${platform}失败`));
    console.log(error);
  }
}

export function getForwardList() {
  return new Promise((resolve) => {
    const cmd = `ps aux | grep '?forwardToOtherPlatform=' | grep -v grep`;
    exec(cmd, (err, stdout, stderr) => {
      resolve({ cmd, err, stdout, stderr });
    });
  });
}

export function killPid(pid: string) {
  return new Promise((resolve) => {
    const cmd = `kill -9 ${pid}`;
    exec(cmd, (err, stdout, stderr) => {
      resolve({ cmd, err, stdout, stderr });
    });
  });
}

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
  const cmd = `ffmpeg -threads 1 -readrate 1 -f concat -safe 0 -i '${data.txt}' -vcodec copy -acodec copy -f flv '${data.rtmpUrl}?${SRS_CB_URL_QUERY.publishKey}=${data.token}'`;
  // const cmd = `ffmpeg -threads 1 -readrate 1 -f concat -safe 0 -i '${data.txt}' -vcodec h264 -acodec aac -f flv '${data.rtmpUrl}?${SRS_CB_URL_QUERY.publishKey}=${data.token}'`;
  exec(cmd, (err, stdout, stderr) => {
    console.log('mp4PushRtmp', cmd);
    console.log(err, stdout, stderr);
  });
}

export function webmToMp4(data: { input: string; output: string }) {
  // -y 选项用于强制覆盖目标文件
  const cmd = `ffmpeg -y -i ${data.input} -vcodec copy -acodec aac ${data.output}`;
  // const cmd = `ffmpeg -i ${data.input} -vcodec copy -an ${data.output}`;
  // console.log(cmd, 'webmToMp4');
  try {
    execSync(cmd, { stdio: 'ignore' });
    // console.log('转码成功', data.input);
    return true;
  } catch (error: any) {
    // console.log('转码失败', data.input);
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
