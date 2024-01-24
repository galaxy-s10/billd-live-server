export interface ISrsCb {
  server_id: string;
  service_id: string;
  action: string;
  client_id: string;
  ip: string;
  vhost: string;
  app: string;
  tcUrl: string;
  stream: string;
  param: string;
  stream_url: string;
  stream_id: string;
}

export interface ISrsRTC {
  api: string;
  clientip: any;
  sdp: string;
  streamurl: string;
  tid: string;
}

export interface IApiV1Streams {
  code: number;
  server: string;
  service: string;
  pid: string;
  streams: {
    id: string;
    name: string;
    vhost: string;
    app: string;
    tcUrl: string;
    url: string;
    live_ms: number;
    clients: number;
    frames: number;
    send_bytes: number;
    recv_bytes: number;
    kbps: {
      recv_30s: number;
      send_30s: number;
    };
    publish: {
      active: boolean;
      cid: string;
    };
    video: {
      codec: string;
      profile: string;
      level: string;
      width: number;
      height: number;
    };
    audio: {
      codec: string;
      sample_rate: number;
      channel: number;
      profile: string;
    };
  }[];
}
export interface IApiV1Clients {
  code: number;
  server: string;
  service: string;
  pid: string;
  clients: {
    id: string;
    vhost: string;
    stream: string;
    ip: string;
    pageUrl: string;
    swfUrl: string;
    tcUrl: string;
    url: string;
    name: string;
    type: string;
    publish: boolean;
    alive: number;
    send_bytes: number;
    recv_bytes: number;
    kbps: {
      recv_30s: number;
      send_30s: number;
    };
  }[];
}
