// websocket消息类型
export const wsMsgType = {
  /** 用户进入聊天 */
  join: 'join',
  /** 用户进入聊天完成 */
  joined: 'joined',
  /** 用户进入聊天 */
  otherJoin: 'otherJoin',
  /** 用户退出聊天 */
  leave: 'leave',
  /** 用户退出聊天完成 */
  leaved: 'leaved',
  /** 当前所有在线用户 */
  liveUser: 'liveUser',
  /** 人满了 */
  full: 'full',
  /** 用户发送消息 */
  message: 'message',
  offer: 'offer',
  answer: 'answer',
  candidate: 'candidate',
};

// websocket连接状态
export const wsConnectStatus = {
  /** 已连接 */
  connection: 'connection',
  /** 连接中 */
  connecting: 'connecting',
  /** 已连接 */
  connected: 'connected',
  /** 断开连接中 */
  disconnecting: 'disconnecting',
  /** 已断开连接 */
  disconnect: 'disconnect',
  /** 重新连接 */
  reconnect: 'reconnect',
};

// websocket用户类型
export const wsUserType = {
  visitor: 1, // 游客
  user: 2, // 用户
};

export const liveExp = 60 * 5; // 5分钟过期

export interface IData<T = any> {
  created_at: string;
  client_ip: string;
  exp?: number;
  data: T;
}

export interface IFrontendToBackendData<T> extends IData {
  created_at: string;
  client_ip: string;
  exp?: number;
  data: T;
}

export interface IBackendToFrontendData<T> extends IData {
  created_at: string;
  client_ip: string;
  exp?: number;
  data: T;
}

export interface IUserInfo {
  id: string;
  userType: number;
  username: string;
  avatar: string;
}
