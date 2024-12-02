import { ILiveRoom } from '@/types/ILiveRoom';
import { IUser } from '@/types/IUser';

export interface IVisitorLog {
  id?: number;
  live_room_id?: number;
  user_id?: number;
  client_ip?: string;
  user_agent?: string;
  duration?: number;
  /** 获取一段时间内，每个ip访问的次数的时候添加的 */
  total?: number;
  /** /visitor_log/create接口的时候添加的 */
  tourist?: {
    info: IUser;
    token: string;
    token_exp: number;
  };

  user?: IUser;

  /** 统计字段 */
  analysis_format_date?: string;
  /** 统计字段 */
  analysis_unique_ip_nums?: number;
  /** 统计字段 */
  analysis_ip_nums?: number;
  /** 统计字段 */
  analysis_unique_user_id_nums?: number;
  /** 统计字段 */
  analysis_user_id_nums?: number;
  /** 统计字段 */
  analysis_average_duration?: number;

  group_user_id?: number;
  parent_user_id?: number;
  parent_user_username?: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

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

export interface ISigninStatistics {
  id?: number;
  user_id?: number;
  live_room_id?: number;
  /** 当前连续签到次数 */
  nums?: number;
  /** 历史最高连续签到次数 */
  max_nums?: number;
  /** 累计签到次数 */
  sum_nums?: number;
  /** 上次签到日期 */
  recently_signin_time?: string;

  /** 用户信息 */
  username?: string;
  user?: IUser;
  /** 直播间信息 */
  live_room?: ILiveRoom;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ISigninRecord {
  id?: number;
  user_id?: number;
  live_room_id?: number;

  /** 用户信息 */
  username?: string;
  user?: IUser;
  /** 直播间信息 */
  live_room?: ILiveRoom;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IInitUser extends IUser {
  user_roles: number[];
  live_room?: ILiveRoom & {
    devFFmpeg: boolean;
    prodFFmpeg: boolean;
    area: number[];
    devFFmpegLocalFile: string;
    prodFFmpegLocalFile: string;
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
  qypShop = 'qypShop',
}

export enum DanmuMsgTypeEnum {
  danmu,
  otherJoin,
  userLeaved,
  system,
  redbag,
}

export enum WsMessageContentTypeEnum {
  txt,
  img,
  video,
}

export interface IWsMessage {
  id?: number;
  live_record_id?: number;
  username?: string;
  origin_username?: string;
  content_type?: WsMessageContentTypeEnum;
  content?: string;
  origin_content?: string;
  live_room_id?: number;
  user_id?: number;
  client_ip?: string;
  msg_type?: DanmuMsgTypeEnum;
  user_agent?: string;
  send_msg_time?: number;
  is_show?: SwitchEnum;
  is_bilibili?: SwitchEnum;
  remark?: string;

  user?: IUser;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IWallet {
  id?: number;
  user_id?: number;
  balance?: number;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export enum WalletRecordEnum {
  reward,
  recharge,
  signin,
}

export enum WalletRecordAmountStatusEnum {
  add,
  del,
}

export interface IWalletRecord {
  id?: number;
  user_id?: number;
  order_id?: number;
  type?: WalletRecordEnum;
  name?: string;
  amount?: number;
  amount_status?: WalletRecordAmountStatusEnum;
  remark?: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ILiveUser {
  created_at: number;
  client_ip: string;
  value: {
    live_room_id: number;
    live_room_name: string;
    user_id: number;
    user_username: string;
    user_avatar: string;
  };
}

export interface IArea {
  id?: number;
  name?: string;
  /** 备注 */
  remark?: string;
  /** 权重 */
  priority?: number;
  area_live_rooms?: IAreaLiveRoom[];

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IDeskConfig {
  id?: number;
  type?: number;
  field_a?: string;
  field_b?: string;
  field_c?: string;
  field_d?: string;
  field_e?: string;
  field_f?: string;
  field_g?: string;
  remark?: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export enum DeskConfigEnum {
  versionConfig,
}

export interface IDeskVersion {
  id?: number;
  /** 1:强制更新; 2:不强制更新 */
  force?: number;
  /** 版本 */
  version?: string;
  /** 显示版本 */
  show_version?: string;
  /** 更新内容 */
  update_content?: string;
  /** 更新日期 */
  update_date?: string;
  /** 是否禁用，1:禁用; 2:不禁用 */
  disable?: number;
  /** 禁用消息 */
  disable_msg?: number;
  download_macos_dmg?: string;
  download_windows_64_exe?: string;
  download_windows_32_exe?: string;
  download_windows_arm_exe?: string;
  download_linux_64_deb?: string;
  download_linux_64_tar?: string;
  download_linux_arm_deb?: string;
  download_linux_arm_tar?: string;
  remark?: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
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

export interface IGoods {
  id?: number;
  type?: GoodsTypeEnum;
  name?: string;
  desc?: string;
  short_desc?: string;
  cover?: string;
  price?: number;
  original_price?: number;
  nums?: number;
  pay_nums?: number;
  inventory?: number;
  badge?: string;
  badge_bg?: string;
  remark?: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IConfig {
  id?: number;
  field_a?: string;
  field_b?: string;
  field_c?: string;
  field_d?: string;
  field_e?: string;
  field_f?: string;
  field_g?: string;
  remark?: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export enum GiftRecordIsRecvEnum {
  yew,
  no,
}

export enum GiftRecordStatusEnum {
  ok,
  balanceError,
}

export interface IGiftRecord {
  id?: number;
  is_recv?: GiftRecordIsRecvEnum;
  goods_id?: number;
  goods_nums?: number;
  goods_snapshot?: string;
  order_id?: number;
  live_room_id?: number;
  send_user_id?: number;
  recv_user_id?: number;
  status?: GiftRecordStatusEnum;
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
  /** 是否是腾讯云云直播，1是，2否 */
  is_tencentcloud_css?: number;
  /** 标识id */
  flag_id?: string;
}

export interface ILiveRecord {
  id?: number;
  /** 直播平台 */
  platform?: LivePlatformEnum;
  /** 直播流名称 */
  stream_name?: string;
  /** 直播流id */
  stream_id?: string;
  /** 用户id */
  user_id?: number;
  /** 直播间id */
  live_room_id?: number;
  /** 直播时长（单位：秒） */
  duration?: number;
  /** 弹幕数 */
  danmu?: number;
  /** 观看数 */
  view?: number;
  /** 直播开始时间 */
  start_time?: string;
  /** 直播结束时间 */
  end_time?: string;
  /** 备注 */
  remark?: string;

  /** 直播间信息 */
  live_room?: ILiveRoom;
  /** 用户信息 */
  user?: IUser;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IBlacklist {
  id?: number;
  client_ip?: string;
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
  status?: number;
  api_user_agent?: string;
  api_duration?: number;
  api_from?: number;
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

export enum LoginRecordEnum {
  registerUsername,
  registerId,
  registerQq,
  loginUsername,
  loginId,
  loginQq,
}

export interface ILoginRecord {
  id?: number;
  user_id?: number;
  user_agent?: string;
  type?: LoginRecordEnum;
  client_ip?: string;
  remark?: string;

  user?: IUser;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export enum GlobalMsgTypeEnum {
  user = 'user',
  system = 'system',
  activity = 'activity',
}

export interface IGlobalMsg {
  id?: number;
  user_id?: number;
  client_ip?: string;
  type?: GlobalMsgTypeEnum;
  show?: SwitchEnum;
  priority?: number;
  content?: string;
  remark?: string;

  user?: IUser;

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

export type IListBase = {
  nowPage?: number | string;
  pageSize?: number | string;
  orderBy?: string;
  orderName?: string;
  keyWord?: string;
  childNowPage?: number | string;
  childPageSize?: number | string;
  childOrderBy?: string;
  childOrderName?: string;
  childKeyWord?: string;
  rangTimeType?: 'created_at' | 'updated_at' | 'deleted_at';
  rangTimeStart?: number | string;
  rangTimeEnd?: number | string;
};

export type IList<T> = IListBase & T;

export interface IRedisVal<T> {
  created_at: number;
  expired_at: number;
  format_created_at: string;
  format_expired_at: string;
  client_ip: string;
  value: T;
}

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
  day: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IHourData {
  id?: number;
  hour: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IMinuteData {
  id?: number;
  minute: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export enum SwitchEnum {
  yes,
  no,
}

export type ILive = {
  id?: number;
  /** 直播记录id */
  live_record_id?: number;
  /** 直播平台 */
  platform?: LivePlatformEnum;
  /** 直播流名称 */
  stream_name?: string;
  /** 直播流id */
  stream_id?: string;
  /** 用户id */
  user_id?: number;
  /** 直播间id */
  live_room_id?: number;
  /** 备注 */
  remark?: string;

  /** 直播间信息 */
  live_room?: ILiveRoom;
  /** 用户信息 */
  user?: IUser;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
};

/** 直播平台 */
export enum LivePlatformEnum {
  rtc,
  srs,
  tencentcloud_css,
}

export enum ClientEnvEnum {
  android,
  ios,
  ipad,
  web,
  web_mobile,
  web_pc,
  windows,
  macos,
}

export interface ILiveView {
  id?: number;
  /** 直播记录id */
  live_record_id?: number;
  /** 直播间id */
  live_room_id?: number;
  /** 用户id */
  user_id?: number;
  /** 时长（单位：秒） */
  duration?: number;
  user_agent?: string;
  client_ip?: string;
  client_env?: ClientEnvEnum;
  /** 备注 */
  remark?: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
