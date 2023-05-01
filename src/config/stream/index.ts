const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 9000,
    allow_origin: '*',
  },
};

export const connectNodeMediaServer = () => {
  // console.log(chalkINFO('初始化流媒体服务器'));
  // const nms = new NodeMediaServer(config);
  // nms.run();
  // nms.on('preConnect', (id, args) => {
  //   console.log(
  //     '[NodeEvent on preConnect]',
  //     `id=${id} args=${JSON.stringify(args)}`
  //   );
  //   // let session = nms.getSession(id);
  //   // session.reject();
  // });
  // nms.on('postConnect', (id, args) => {
  //   console.log(
  //     '[NodeEvent on postConnect]',
  //     `id=${id} args=${JSON.stringify(args)}`
  //   );
  // });
};
