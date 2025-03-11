import { DEFAULT_AUTH_INFO, DEFAULT_ROLE_INFO } from '@/constant';
import {
  FormTypeEnum,
  GlobalMsgTypeEnum,
  GoodsTypeEnum,
  IArea,
  IAuth,
  IConfig,
  IGlobalMsg,
  IGoods,
  IRole,
  StatusEnum,
  SwitchEnum,
} from '@/interface';

const initAuth = () => {
  const deafultAuth: IAuth[] = [
    {
      id: DEFAULT_AUTH_INFO.ALL_AUTH.id,
      auth_name: '全部权限',
      auth_value: DEFAULT_AUTH_INFO.ALL_AUTH.auth_value,
      type: 1,
      priority: 99,
      p_id: 0,
    },
    {
      id: DEFAULT_AUTH_INFO.USER_MANAGE.id,
      auth_name: '用户管理',
      auth_value: DEFAULT_AUTH_INFO.USER_MANAGE.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.ALL_AUTH.id,
    },
    {
      id: DEFAULT_AUTH_INFO.ROLE_MANAGE.id,
      auth_name: '角色管理',
      auth_value: DEFAULT_AUTH_INFO.ROLE_MANAGE.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.ALL_AUTH.id,
    },
    {
      id: DEFAULT_AUTH_INFO.AUTH_MANAGE.id,
      auth_name: '权限管理',
      auth_value: DEFAULT_AUTH_INFO.AUTH_MANAGE.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.ALL_AUTH.id,
    },
    {
      id: DEFAULT_AUTH_INFO.MESSAGE_MANAGE.id,
      auth_name: '消息管理',
      auth_value: DEFAULT_AUTH_INFO.MESSAGE_MANAGE.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.ALL_AUTH.id,
    },
    {
      id: DEFAULT_AUTH_INFO.MESSAGE_SEND.id,
      auth_name: '消息发送',
      auth_value: DEFAULT_AUTH_INFO.MESSAGE_SEND.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.MESSAGE_MANAGE.id,
    },
    {
      id: DEFAULT_AUTH_INFO.MESSAGE_DISABLE.id,
      auth_name: '消息禁用',
      auth_value: DEFAULT_AUTH_INFO.MESSAGE_DISABLE.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.MESSAGE_MANAGE.id,
    },
    {
      id: DEFAULT_AUTH_INFO.LOG_MANAGE.id,
      auth_name: '日志管理',
      auth_value: DEFAULT_AUTH_INFO.LOG_MANAGE.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.ALL_AUTH.id,
    },
    {
      id: DEFAULT_AUTH_INFO.LIVE_MANAGE.id,
      auth_name: '直播管理',
      auth_value: DEFAULT_AUTH_INFO.LIVE_MANAGE.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.ALL_AUTH.id,
    },
    {
      id: DEFAULT_AUTH_INFO.LIVE_PUSH.id,
      auth_name: '直播推流',
      auth_value: DEFAULT_AUTH_INFO.LIVE_PUSH.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.LIVE_MANAGE.id,
    },
    {
      id: DEFAULT_AUTH_INFO.LIVE_PUSH_CDN.id,
      auth_name: '直播推流(CDN)',
      auth_value: DEFAULT_AUTH_INFO.LIVE_PUSH_CDN.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.LIVE_MANAGE.id,
    },
    {
      id: DEFAULT_AUTH_INFO.LIVE_PULL.id,
      auth_name: '直播拉流',
      auth_value: DEFAULT_AUTH_INFO.LIVE_PULL.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.LIVE_MANAGE.id,
    },
    {
      id: DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_BILIBILI.id,
      auth_name: '直播转推（bilibili）',
      auth_value: DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_BILIBILI.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.LIVE_MANAGE.id,
    },
    {
      id: DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_HUYA.id,
      auth_name: '直播转推（虎牙）',
      auth_value: DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_HUYA.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.LIVE_MANAGE.id,
    },
    {
      id: DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_DOUYU.id,
      auth_name: '直播转推（斗鱼）',
      auth_value: DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_DOUYU.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.LIVE_MANAGE.id,
    },
    {
      id: DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_DOUYIN.id,
      auth_name: '直播转推（抖音）',
      auth_value: DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_DOUYIN.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.LIVE_MANAGE.id,
    },
    {
      id: DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_KUAISHOU.id,
      auth_name: '直播转推（快手）',
      auth_value: DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_KUAISHOU.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.LIVE_MANAGE.id,
    },
    {
      id: DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_XIAOHONGSHU.id,
      auth_name: '直播转推（小红书）',
      auth_value: DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_XIAOHONGSHU.auth_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_AUTH_INFO.LIVE_MANAGE.id,
    },
  ];

  return deafultAuth;
};

const initRole = () => {
  const defaultRole: IRole[] = [
    {
      id: DEFAULT_ROLE_INFO.ALL_ROLE.id,
      role_name: '全部角色',
      role_value: DEFAULT_ROLE_INFO.ALL_ROLE.role_value,
      type: 1,
      priority: 99,
      p_id: 0,
    },
    {
      id: DEFAULT_ROLE_INFO.ADMIN.id,
      role_name: '管理员',
      role_value: DEFAULT_ROLE_INFO.ADMIN.role_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_ROLE_INFO.ALL_ROLE.id,
    },
    {
      id: DEFAULT_ROLE_INFO.SUPER_ADMIN.id,
      role_name: '超级管理员',
      role_value: DEFAULT_ROLE_INFO.SUPER_ADMIN.role_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_ROLE_INFO.ADMIN.id,
    },
    {
      id: DEFAULT_ROLE_INFO.LIVE_ADMIN.id,
      role_name: '直播超管',
      role_value: DEFAULT_ROLE_INFO.LIVE_ADMIN.role_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_ROLE_INFO.ADMIN.id,
    },
    {
      id: DEFAULT_ROLE_INFO.USER.id,
      role_name: '用户',
      role_value: DEFAULT_ROLE_INFO.USER.role_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_ROLE_INFO.ALL_ROLE.id,
    },
    {
      id: DEFAULT_ROLE_INFO.VIP_USER.id,
      role_name: 'VIP用户',
      role_value: DEFAULT_ROLE_INFO.VIP_USER.role_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_ROLE_INFO.USER.id,
    },
    {
      id: DEFAULT_ROLE_INFO.SVIP_USER.id,
      role_name: 'SVIP用户',
      role_value: DEFAULT_ROLE_INFO.SVIP_USER.role_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_ROLE_INFO.USER.id,
    },
    {
      id: DEFAULT_ROLE_INFO.TOURIST_USER.id,
      role_name: '游客',
      role_value: DEFAULT_ROLE_INFO.TOURIST_USER.role_value,
      type: 1,
      priority: 99,
      p_id: DEFAULT_ROLE_INFO.USER.id,
    },
  ];
  return defaultRole;
};

const initRoleAuth = () => {
  const auth = initAuth();
  const roleAuth: any = [];
  let id = 0;
  auth.forEach((v) => {
    id += 1;
    roleAuth.push({
      id,
      role_id: 1,
      auth_id: v.id,
    });
  });

  [
    DEFAULT_AUTH_INFO.AUTH_MANAGE,
    DEFAULT_AUTH_INFO.ROLE_MANAGE,
    DEFAULT_AUTH_INFO.USER_MANAGE,
    DEFAULT_AUTH_INFO.MESSAGE_MANAGE,
    DEFAULT_AUTH_INFO.MESSAGE_SEND,
    DEFAULT_AUTH_INFO.MESSAGE_DISABLE,
    DEFAULT_AUTH_INFO.LIVE_MANAGE,
    DEFAULT_AUTH_INFO.LIVE_PUSH,
    DEFAULT_AUTH_INFO.LIVE_PUSH_CDN,
    DEFAULT_AUTH_INFO.LIVE_PULL,
    DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_BILIBILI,
    DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_DOUYIN,
    DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_DOUYU,
    DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_HUYA,
    DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_XIAOHONGSHU,
    DEFAULT_AUTH_INFO.LIVE_PUSH_FORWARD_KUAISHOU,
  ].forEach((item) => {
    id += 1;
    roleAuth.push({
      id,
      role_id: DEFAULT_ROLE_INFO.SUPER_ADMIN.id,
      auth_id: item.id,
    });
  });

  [
    DEFAULT_AUTH_INFO.USER_MANAGE,
    DEFAULT_AUTH_INFO.MESSAGE_MANAGE,
    DEFAULT_AUTH_INFO.MESSAGE_SEND,
    DEFAULT_AUTH_INFO.MESSAGE_DISABLE,
    DEFAULT_AUTH_INFO.LIVE_MANAGE,
    DEFAULT_AUTH_INFO.LIVE_PUSH,
    DEFAULT_AUTH_INFO.LIVE_PUSH_CDN,
    DEFAULT_AUTH_INFO.LIVE_PULL,
  ].forEach((item) => {
    id += 1;
    roleAuth.push({
      id,
      role_id: DEFAULT_ROLE_INFO.LIVE_ADMIN.id,
      auth_id: item.id,
    });
  });

  [
    DEFAULT_AUTH_INFO.MESSAGE_SEND,
    DEFAULT_AUTH_INFO.LIVE_PUSH,
    DEFAULT_AUTH_INFO.LIVE_PUSH_CDN,
    DEFAULT_AUTH_INFO.LIVE_PULL,
  ].forEach((item) => {
    id += 1;
    roleAuth.push({
      id,
      role_id: DEFAULT_ROLE_INFO.SVIP_USER.id,
      auth_id: item.id,
    });
  });

  [
    DEFAULT_AUTH_INFO.MESSAGE_SEND,
    DEFAULT_AUTH_INFO.LIVE_PUSH,
    DEFAULT_AUTH_INFO.LIVE_PULL,
  ].forEach((item) => {
    id += 1;
    roleAuth.push({
      id,
      role_id: DEFAULT_ROLE_INFO.VIP_USER.id,
      auth_id: item.id,
    });
  });

  [DEFAULT_AUTH_INFO.LIVE_PULL].forEach((item) => {
    id += 1;
    roleAuth.push({
      id,
      role_id: DEFAULT_ROLE_INFO.TOURIST_USER.id,
      auth_id: item.id,
    });
  });

  return roleAuth;
};

export const bulkCreateArea = (): IArea[] => {
  let result: IArea[] = [
    {
      id: 1,
      p_id: 0,
      name: '音乐',
      remark: '音乐分区',
      priority: 15,
      status: StatusEnum.normal,
      hot_status: SwitchEnum.no,
      children: [],
    },
    {
      id: 2,
      p_id: 0,
      name: '知识',
      remark: '知识分区',
      priority: 9,
      status: StatusEnum.normal,
      hot_status: SwitchEnum.no,
      children: [],
    },
    {
      id: 3,
      p_id: 0,
      name: '手游',
      remark: '手游分区',
      priority: 19,
      status: StatusEnum.normal,
      hot_status: SwitchEnum.no,
      children: [],
    },
    {
      id: 4,
      p_id: 0,
      name: '网游',
      remark: '网游分区',
      priority: 20,
      status: StatusEnum.normal,
      hot_status: SwitchEnum.no,
      children: [],
    },
    {
      id: 5,
      p_id: 0,
      name: '单机游戏',
      remark: '单机游戏分区',
      priority: 18,
      status: StatusEnum.normal,
      hot_status: SwitchEnum.no,
      children: [],
    },
    {
      id: 6,
      p_id: 0,
      name: '娱乐',
      remark: '娱乐分区',
      priority: 17,
      status: StatusEnum.normal,
      hot_status: SwitchEnum.no,
      children: [],
    },
    {
      id: 7,
      p_id: 0,
      name: '生活',
      remark: '生活分区',
      priority: 16,
      status: StatusEnum.normal,
      hot_status: SwitchEnum.no,
      children: [],
    },
  ];
  let addId = result.length;
  result = result.map((item) => {
    const val = { ...item };
    if (val.id === 1) {
      [
        {
          p_id: val.id,
          name: '流行',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '民谣',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '轻音乐',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '原声带',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '古典',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '金属',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
      ].forEach((x) => {
        addId += 1;
        val.children?.push({ ...x, id: addId });
      });
    } else if (val.id === 2) {
      [
        {
          p_id: val.id,
          name: '科技',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '教育学习',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '自习室',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '历史',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
      ].forEach((x) => {
        addId += 1;
        val.children?.push({ ...x, id: addId });
      });
    } else if (val.id === 3) {
      [
        {
          p_id: val.id,
          name: '王者荣耀',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '和平精英',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '原神',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '第五人格',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '蛋仔派对',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '元梦之星',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: 'CF手游',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: 'QQ飞车手游',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '欢乐斗地主',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '阴阳师',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '少女前线',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '梦幻西游手游',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '游戏王',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '崩坏3',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '崩坏：星穹铁道',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '鸣潮',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '火影忍者手游',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '碧蓝航线',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '决战！平安京',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '狼人杀',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
      ].forEach((x) => {
        addId += 1;
        val.children?.push({ ...x, id: addId });
      });
    } else if (val.id === 4) {
      [
        {
          p_id: val.id,
          name: '英雄联盟',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: 'DOTA2',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '守望先锋',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '魔兽世界',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '穿越火线',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: 'APEX英雄',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: 'CS:GO',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: 'DNF',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: 'QQ飞车',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '三角洲行动',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '三国杀',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '逆战',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '龙之谷',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '冒险岛',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '炉石传说',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '最终幻想14',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '赛尔号',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '剑网3',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '大话西游',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '吃鸡行动',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '永劫无间',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '生死狙击2',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '剑网3缘起',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '暗区突围：无限',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
      ].forEach((x) => {
        addId += 1;
        val.children?.push({ ...x, id: addId });
      });
    } else if (val.id === 5) {
      [
        {
          p_id: val.id,
          name: '主机游戏',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '独立游戏',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '怀旧游戏',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '黑神话：悟空',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '幻兽帕鲁',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: 'NBA2K',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '使命召唤21',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '我的世界',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '生化危机',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '荒野大嫖客2',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '刺客信条',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '赛博朋克2077',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '糖豆人',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '方舟',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '鬼泣5',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '塞尔达传说',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '饥荒',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '战地风云',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
      ].forEach((x) => {
        addId += 1;
        val.children?.push({ ...x, id: addId });
      });
    } else if (val.id === 6) {
      [
        {
          p_id: val.id,
          name: '颜值',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '舞见',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '萌宅',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
      ].forEach((x) => {
        addId += 1;
        val.children?.push({ ...x, id: addId });
      });
    } else if (val.id === 7) {
      [
        {
          p_id: val.id,
          name: '情感',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '手工绘画',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '户外',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '美食',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '萌宠',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
        {
          p_id: val.id,
          name: '时尚',
          remark: '',
          priority: 9,
          status: StatusEnum.normal,
          hot_status: SwitchEnum.no,
        },
      ].forEach((x) => {
        addId += 1;
        val.children?.push({ ...x, id: addId });
      });
    }
    return val;
  });
  return result;
};

export const bulkCreateGoods: IGoods[] = [
  {
    type: GoodsTypeEnum.gift,
    name: '鲜花',
    desc: '一朵鲜花',
    short_desc: '鲜花',
    price: 1,
    original_price: 1,
    badge: '',
    badge_bg: 'pink',
    nums: 1,
    cover: '',
  },
  {
    type: GoodsTypeEnum.gift,
    name: '可乐',
    desc: '肥宅快乐水',
    short_desc: '可乐',
    price: 200,
    original_price: 200,
    badge: '新品',
    badge_bg: '#e60c0d',
    nums: 1,
    cover: '',
  },
  {
    type: GoodsTypeEnum.gift,
    name: '大鸡腿',
    desc: '美味的大鸡腿，谁顶得住？',
    short_desc: '大鸡腿',
    price: 500,
    original_price: 500,
    badge: '',
    badge_bg: '',
    nums: 1,
    cover: '',
  },
  {
    type: GoodsTypeEnum.gift,
    name: '一杯咖啡',
    desc: '给阿姨倒一杯卡布奇诺',
    short_desc: '一杯咖啡',
    price: 1000,
    original_price: 1000,
    badge: '肝！',
    badge_bg: '#cda8a1',
    nums: 1,
    cover: '',
  },
  {
    type: GoodsTypeEnum.sponsors,
    name: '一根辣条',
    desc: '卫龙牌辣条',
    short_desc: '一根辣条',
    price: 10,
    original_price: 10,
    badge: '',
    badge_bg: '',
    nums: 1,
    cover: '',
  },
  {
    type: GoodsTypeEnum.sponsors,
    name: '一根烤肠',
    desc: '一块钱的淀粉肠',
    short_desc: '一根烤肠',
    price: 100,
    original_price: 100,
    badge: '',
    badge_bg: '',
    nums: 1,
    cover: '',
  },
  {
    type: GoodsTypeEnum.sponsors,
    name: '一杯奶茶',
    desc: '一杯益禾堂烤奶',
    short_desc: '一杯奶茶',
    price: 1000,
    original_price: 1000,
    badge: '',
    badge_bg: '',
    nums: 1,
    cover: '',
  },
  {
    type: GoodsTypeEnum.sponsors,
    name: '一杯咖啡',
    desc: '一杯星巴克咖啡',
    short_desc: '一杯咖啡',
    price: 2500,
    original_price: 2500,
    badge: '',
    badge_bg: '',
    nums: 1,
    cover: '',
  },
  {
    type: GoodsTypeEnum.sponsors,
    name: '肯德基全家桶',
    desc: '肯德基疯狂星期四，v我50！',
    short_desc: '肯德基全家桶',
    price: 5000,
    original_price: 5000,
    badge: 'crazy',
    badge_bg: '#cda8a1',
    nums: 1,
    cover: '',
  },
  {
    type: GoodsTypeEnum.sponsors,
    name: '一顿海底捞',
    desc: '一起嗨，海底捞',
    short_desc: '一顿海底捞',
    price: 10000,
    original_price: 10000,
    badge: '',
    badge_bg: '',
    nums: 1,
    cover: '',
  },
  {
    type: GoodsTypeEnum.support,
    name: '一对一解答（0.5小时）',
    desc: '包括但不限于billd-live相关的任何问题。',
    short_desc: '一对一解答（0.5小时）',
    price: 2000,
    original_price: 2500,
    badge: '新人优惠',
    badge_bg: '#8fcbee',
    nums: 1,
    cover: '',
  },
  {
    type: GoodsTypeEnum.support,
    name: '一对一解答（1小时）',
    desc: '包括但不限于billd-live相关的任何问题。',
    short_desc: '一对一解答（1小时）',
    price: 5000,
    original_price: 5000,
    badge: '',
    badge_bg: '',
    nums: 1,
    cover: '',
  },
  {
    type: GoodsTypeEnum.support,
    name: '一对一解答（3小时）',
    desc: '包括但不限于billd-live相关的任何问题。',
    short_desc: '一对一解答（3小时）',
    price: 12000,
    original_price: 15000,
    badge: '',
    badge_bg: '',
    nums: 1,
    cover: '',
  },
  {
    type: GoodsTypeEnum.support,
    name: 'billd-live付费课',
    desc: '从零搭建迷你版b站直播间',
    short_desc: '从零搭建迷你版b站直播间',
    price: 24900,
    original_price: 29900,
    badge: 'hot',
    badge_bg: '#ea3323',
    nums: 1,
    cover: '',
  },
  {
    type: GoodsTypeEnum.recharge,
    name: '自定义充值',
    desc: '自定义充值',
    short_desc: '自定义充值',
    price: 0,
    original_price: 0,
    badge: '',
    badge_bg: '',
    nums: 1,
    cover: '',
  },
];

const initConfig = (): IConfig[] => [
  {
    field_a: 'home_bg',
    field_b: '',
    field_c: FormTypeEnum.upload,
    remark: '直播间前台首页的背景图',
  },
];

const initGlobalMsg = (): IGlobalMsg[] => [
  {
    type: GlobalMsgTypeEnum.system,
    content: '持续更新中',
    show: SwitchEnum.yes,
    priority: 1,
    remark: '首页弹窗内容',
  },
  {
    type: GlobalMsgTypeEnum.user,
    content: '请勿直播传奇游戏！',
    show: SwitchEnum.yes,
    user_id: 2,
    priority: 99,
    remark: '给id为2的用户发消息',
  },
];

export const bulkCreateGlobalMsg = initGlobalMsg();
export const bulkCreateConfig = initConfig();
export const bulkCreateRole = initRole();
export const bulkCreateAuth = initAuth();
export const bulkCreateRoleAuth = initRoleAuth();
