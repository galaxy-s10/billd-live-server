const cmd = (data: {
  listTxt: string;
  rtmpUrl: string;
}) => `ffmpeg -readrate 1 -f concat -safe 0 -i '${data.listTxt}' -vcodec h264 -acodec aac -f flv '${data.rtmpUrl}'
`;
cmd({
  listTxt: '/Users/huangshuisheng/Movies/webm/qlz.txt',
  rtmpUrl:
    'rtmp://localhost/livestream/roomId___102?token=93a5708fb0e3a5c03083f83c41b3cdad&type=3',
});
