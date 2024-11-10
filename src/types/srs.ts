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

export interface ITencentcloudCssPublishCb {
  /** 推流域名 */
  app: string;
  /** 用户 APPID */
  appid: number;
  /** 推流路径 */
  appname: string;
  /** 同直播流名称 */
  channel_id: string;
  /** 推断流错误码 */
  errcode: number;
  /** 推断流错误描述 */
  errmsg: string;
  /** 事件消息产生的 UNIX 时间戳 */
  event_time: number;
  /** event_type，直播推流:1，直播断流:0 */
  event_type: number;
  /** 视频高度，最开始推流回调的时候若视频头部信息缺失，可能为0 */
  height: number;
  idc_id: number;
  /** 直播接入点的 IP */
  node: string;
  /** 消息序列号，标识一次推流活动，一次推流活动会产生相同序列号的推流和断流消息 */
  sequence: string;
  /** 判断是否为国内外推流。1-6为国内，7-200为国外 */
  set_id: number;
  /** 事件通知安全签名 sign = MD5（key + t）。说明：腾讯云把加密 key 和 t 进行字符串拼接后通过 MD5 计算得出 sign 值，并将其放在通知消息里，您的后台服务器在收到通知消息后可以根据同样的算法确认 sign 是否正确，进而确认消息是否确实来自腾讯云后台。 */
  sign: string;
  /** 直播流名称 */
  stream_id: string;
  /** 用户推流 URL 所带参数 */
  stream_param: string;
  /** 过期时间，事件通知签名过期 UNIX 时间戳。 */
  t: number;
  /** 用户推流 IP */
  user_ip: string;
  /** 视频宽度，最开始推流回调的时候若视频头部信息缺失，可能为0 */
  width: number;
}

export interface ITencentcloudCssUnPublishCb {
  /** 推流域名 */
  app: string;
  /** 用户 APPID */
  appid: number;
  /** 推流路径 */
  appname: string;
  /** 同直播流名称 */
  channel_id: string;
  /** 推断流错误码 */
  errcode: number;
  /** 推断流错误描述 */
  errmsg: string;
  /** 事件消息产生的 UNIX 时间戳 */
  event_time: number;
  /** event_type，直播推流:1，直播断流:0 */
  event_type: number;
  /** 视频高度，最开始推流回调的时候若视频头部信息缺失，可能为0 */
  height: number;
  idc_id: number;
  /** 直播接入点的 IP */
  node: string;
  /** 断流事件通知推流时长，单位毫秒 */
  push_duration: string;
  /** 消息序列号，标识一次推流活动，一次推流活动会产生相同序列号的推流和断流消息 */
  sequence: string;
  /** 判断是否为国内外推流。1-6为国内，7-200为国外 */
  set_id: number;
  /** 事件通知安全签名 sign = MD5（key + t）。说明：腾讯云把加密 key 和 t 进行字符串拼接后通过 MD5 计算得出 sign 值，并将其放在通知消息里，您的后台服务器在收到通知消息后可以根据同样的算法确认 sign 是否正确，进而确认消息是否确实来自腾讯云后台。 */
  sign: string;
  /** 直播流名称 */
  stream_id: string;
  /** 用户推流 URL 所带参数 */
  stream_param: string;
  /** 过期时间，事件通知签名过期 UNIX 时间戳。 */
  t: number;
  /** 用户推流 IP */
  user_ip: string;
  /** 视频宽度，最开始推流回调的时候若视频头部信息缺失，可能为0 */
  width: number;
}

export interface ISrsRTC {
  sdp: string;
  streamurl: string;
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
