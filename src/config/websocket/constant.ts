// websocket消息类型
export const wsMsgType = {
  /** 用户连接 */
  connect: 'connect',
  /** 用户进入聊天 */
  userInRoom: 'userInRoom',
  /** 游客切换头像 */
  visitorSwitchAvatar: 'visitorSwitchAvatar',
  /** 用户退出聊天 */
  userOutRoom: 'userOutRoom',
  /** 用户发送消息 */
  userSendMsg: 'userSendMsg',
  /** 获取在线数据 */
  getOnlineData: 'getOnlineData',
  /** 用户存活 */
  live: 'live',
  /** 用户点歌 */
  chooseSong: 'chooseSong',
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
