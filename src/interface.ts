export interface IQiniuData {
  id?: number;
  user_id?: number;
  prefix?: string;
  bucket?: string;
  qiniu_key?: string;
  qiniu_hash?: string;
  qiniu_fsize?: number;
  qiniu_mimeType?: string;
  qiniu_putTime?: string;
  qiniu_type?: number;
  qiniu_status?: number;
  qiniu_md5?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IInitUser extends IUser {
  user_roles: number[];
  live_room: ILiveRoom & {
    devFFmpeg: boolean;
    prodFFmpeg: boolean;
    area: number[];
    localFile: string;
  };
}

export enum liveEnum {
  srs = 1,
  webrtc,
}

export enum PayStatusEnum {
  wait = 'billd_status_wait',
  timeout = 'billd_status_timeout',
  /** （交易创建，等待买家付款） */
  WAIT_BUYER_PAY = 'WAIT_BUYER_PAY',
  /** （交易支付成功） */
  TRADE_SUCCESS = 'TRADE_SUCCESS',
  /** （未付款交易超时关闭，或支付完成后全额退款） */
  TRADE_CLOSED = 'TRADE_CLOSED',
  /** （交易结束，不可退款） */
  TRADE_FINISHED = 'TRADE_FINISHED',
}

export enum GoodsTypeEnum {
  support = 'support',
  sponsors = 'sponsors',
  gift = 'gift',
  recharge = 'recharge',
}

export enum DanmuMsgTypeEnum {
  danmu,
  otherJoin,
  userLeaved,
}

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

export interface IWallet {
  id?: number;
  user_id?: number;
  balance?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IQqUser {
  id?: number;
  client_id?: number;
  openid?: string;
  unionid?: string;
  nickname?: string;
  figureurl?: string;
  figureurl_1?: string;
  figureurl_2?: string;
  figureurl_qq_1?: string;
  figureurl_qq_2?: string;
  constellation?: string;
  gender?: string;
  city?: string;
  province?: string;
  year?: string;
  ret?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IThirdUser {
  id?: number;
  user_id?: number;
  third_user_id?: number;
  third_platform?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

/** 直播间类型 */
export enum LiveRoomTypeEnum {
  /** 系统直播 */
  system,
  /** 主播使用webrtc直播 */
  user_wertc,
  /** 主播使用srs直播 */
  user_srs,
  /** 主播使用obs/ffmpeg直播 */
  user_obs,
  /** 主播使用msr直播 */
  user_msr,
}

/** 拉流是否需要鉴权 */
export enum LiveRoomPullIsShouldAuthEnum {
  /** 需要鉴权 */
  yes,
  /** 不需要鉴权 */
  no,
}

export interface IArea {
  id?: number;
  name?: string;
  /** 备注 */
  remark?: string;
  /** 权重 */
  weight?: number;
  area_live_rooms?: IAreaLiveRoom[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ILiveRoom {
  id?: number;
  /** 用户信息 */
  user?: IUser;
  /** 用户信息 */
  users?: IUser[];
  /** 分区信息 */
  area?: IArea;
  /** 直播信息 */
  live?: ILive;
  user_live_room?: IUserLiveRoom & { user: IUser };
  name?: string;
  desc?: string;
  /** 1:使用cdn;2:不使用cdn */
  cdn?: number;
  /** 权重 */
  weight?: number;
  /** 推流秘钥 */
  key?: string;
  /** 直播间类型 */
  type?: LiveRoomTypeEnum;
  /** 拉流是否需要鉴权 */
  pull_is_should_auth?: LiveRoomPullIsShouldAuthEnum;
  cover_img?: string;
  rtmp_url?: string;
  flv_url?: string;
  hls_url?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IUser {
  id?: number;
  username?: string;
  password?: string;
  email?: string;
  status?: number;
  avatar?: string;
  desc?: string;
  token?: string;
  user_roles?: number[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  qq_users?: IQqUser[];
  wallet?: IWallet;
  live_room?: ILiveRoom;
  live_rooms?: ILiveRoom[];
}

export interface IAreaLiveRoom {
  id?: number;
  area_id?: number;
  live_room_id?: number;
  /** 分区信息 */
  area?: IUser;
  /** 直播间信息 */
  live_room?: ILiveRoom;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IUserLiveRoom {
  id?: number;
  user_id?: number;
  live_room_id?: number;
  /** 用户信息 */
  user?: IUser;
  /** 直播间信息 */
  live_room?: ILiveRoom;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export enum FormTypeEnum {
  'input' = 'input',
  'password' = 'password',
  'number' = 'number',
  'select' = 'select',
  'radio' = 'radio',
  'checkbox' = 'checkbox',
  'markdown' = 'markdown',
  'switch' = 'switch',
  'upload' = 'upload',
  'treeSelect' = 'treeSelect',
  'datePicker' = 'datePicker',
}

export interface ILiveConfig {
  id?: number;
  key?: string;
  value?: string;
  desc?: string;
  type?: FormTypeEnum;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IGoods {
  id?: number;
  type?: GoodsTypeEnum;
  name?: string;
  desc?: string;
  short_desc?: string;
  cover?: string;
  price?: string;
  original_price?: string;
  nums?: number;
  badge?: string;
  badge_bg?: string;
  remark?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IOrder {
  id?: number;
  /** 用户信息 */
  user?: IUser;
  /** 商品信息 */
  goods?: IGoods;
  /** 直播间信息 */
  live_room?: IGoods;

  billd_live_user_id?: number;
  billd_live_goods_id?: number;
  billd_live_live_room_id?: number;
  billd_live_order_subject?: string;
  /** 判断幂等 */
  billd_live_order_version?: number;
  client_ip?: string;

  product_code?: string;
  qr_code?: string;
  /** 买家支付宝账号 */
  buyer_logon_id?: string;
  /** 买家实付金额，单位为元，两位小数。 */
  buyer_pay_amount?: string;
  /** 买家在支付宝的用户id */
  buyer_user_id?: string;
  /** 交易的订单金额，单位为元，两位小数。该参数的值为支付时传入的total_amount */
  total_amount?: string;
  /** 交易中用户支付的可开具发票的金额，单位为元，两位小数。 */
  invoice_amount?: string;
  /** 积分支付的金额，单位为元，两位小数。 */
  point_amount?: string;
  /** 实收金额，单位为元，两位小数。该金额为本笔交易，商户账户能够实际收到的金额 */
  receipt_amount?: string;
  /** 支付宝交易号 */
  trade_no?: string;
  /** 商家订单号 */
  out_trade_no?: string;
  /** 交易状态：WAIT_BUYER_PAY（交易创建，等待买家付款）、TRADE_CLOSED（未付款交易超时关闭，或支付完成后全额退款）、TRADE_SUCCESS（交易支付成功）、TRADE_FINISHED（交易结束，不可退款） */
  trade_status?: PayStatusEnum;
  /** 本次交易打款给卖家的时间 */
  send_pay_date?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ISrsPublishStream {
  /** 客户端在获取信息时，必须检查ServerID是否改变，改变时就是服务器重启，之前所有的数据都应该作废了。 */
  srs_server_id?: string;
  srs_service_id?: string;
  srs_action?: string;
  srs_client_id?: string;
  srs_ip?: string;
  srs_vhost?: string;
  srs_app?: string;
  srs_tcUrl?: string;
  srs_stream?: string;
  srs_param?: string;
  srs_stream_url?: string;
  srs_stream_id?: string;
}

export interface ILive extends ISrsPublishStream {
  id?: number;
  /** 用户信息 */
  user?: IUser;
  /** 直播间信息 */
  live_room?: ILiveRoom;

  socket_id?: string;
  user_id?: number;
  live_room_id?: number;
  /** 1开启;2关闭 */
  track_video?: number;
  /** 1开启;2关闭 */
  track_audio?: number;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ILivePlay extends ISrsPublishStream {
  id?: number;

  /** 用户信息 */
  user?: IUser;
  /** 直播间信息 */
  live_room?: ILiveRoom;

  random_id?: string;
  user_id?: number;
  live_room_id?: number;
  end_time?: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ILiveRecord {
  id?: number;

  /** 用户信息 */
  user?: IUser;
  /** 直播间信息 */
  live_room?: ILiveRoom;

  client_id?: string;
  user_id?: number;
  live_room_id?: number;
  /** 直播时长 */
  duration?: number;
  /** 弹幕数 */
  danmu?: number;
  /** 观看数 */
  view?: number;
  /** 直播结束时间 */
  end_time?: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IBlacklist {
  id?: number;
  ip?: string;
  user_id?: number;
  type?: number;
  msg?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IEmail {
  id?: number;
  email?: string;
  code?: string;
  exp?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ILog {
  id?: number;
  user_id?: number;
  api_user_agent?: string;
  api_duration?: number;
  api_forwarded_for?: string;
  api_referer?: string;
  api_real_ip?: string;
  api_host?: string;
  api_hostname?: string;
  api_method?: string;
  api_path?: string;
  api_query?: string;
  api_body?: string;
  api_status_code?: number;
  api_error?: string;
  api_err_msg?: string;
  api_err_code?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IAuth {
  id?: number;
  p_id?: number;
  auth_name?: string;
  auth_value?: string;
  type?: number;
  priority?: number;
  c_auths?: number[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IRole {
  id?: number;
  p_id?: number;
  role_name?: string;
  role_value?: string;
  type?: number;
  priority?: number;
  role_auths?: number[];
  c_roles?: number[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IRoleAuth {
  id?: number;
  role_id?: number;
  auth_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export type IList<T> = {
  nowPage?: string;
  pageSize?: string;
  orderBy?: string;
  orderName?: string;
  keyWord?: string;
  rangTimeType?: 'created_at' | 'updated_at' | 'deleted_at';
  rangTimeStart?: string;
  rangTimeEnd?: string;
} & T;

export interface IUserRole {
  id?: number;
  user_id: number;
  role_id: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IDayData {
  id?: number;
  today: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
