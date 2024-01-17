import { exec } from 'child_process';

import { SRS_CB_URL_PARAMS } from '@/constant';

/** 杀死所有ffmpeg进程 */
export function killAllFFmpeg() {
  // 查看所有ffmpeg进程：ps aux | grep ffmpeg | grep -v grep | awk '{print $2}'
  // 杀死所有ffmpeg进程：kill -9 `ps aux | grep ffmpeg | grep -v grep | awk '{print $2}'`
  const cmd = `kill -9 \`ps aux | grep ffmpeg | grep -v grep | awk '{print $2}'\``;
  exec(cmd);
}

export function mp4PushRtmp(data: {
  txt: string;
  rtmpUrl: string;
  token: string;
}) {
  const cmd = `ffmpeg -threads 1 -readrate 1 -f concat -safe 0 -i '${data.txt}' -vcodec copy -acodec copy -f flv '${data.rtmpUrl}?${SRS_CB_URL_PARAMS.publishKey}=${data.token}'`;
  // const cmd = `ffmpeg -threads 1 -readrate 1 -f concat -safe 0 -i '${data.txt}' -vcodec h264 -acodec aac -f flv '${data.rtmpUrl}?${SRS_CB_URL_PARAMS.publishKey}=${data.token}'`;
  console.log(cmd, 'mp4PushRtmp');
  exec(cmd);
}

export function webmToMp4(data: { input: string; output: string }) {
  const cmd = `ffmpeg -i ${data.input} -vcodec copy -acodec aac ${data.output}`;
  // const cmd = `ffmpeg -i ${data.input} -vcodec copy -an ${data.output}`;
  // console.log(cmd, 'webmToMp4');
  exec(cmd);
}
