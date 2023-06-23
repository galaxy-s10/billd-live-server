import { getRandomString } from 'billd-utils';

import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import { fddmHyzdwmglBase64 } from '@/init/base64/fddm_hyzdwmgl';
import { fddmMhswBase64 } from '@/init/base64/fddm_mhsw';
import { fddmNswwsbddjaBase64 } from '@/init/base64/fddm_nswwsbddja';
import { fddmSnjxhBase64 } from '@/init/base64/fddm_snjxh';
import { fddmXyzcslBase64 } from '@/init/base64/fddm_xyzcsl';
import { fddmYycyBase64 } from '@/init/base64/fddm_yycy';
import { GoodsTypeEnum, IArea, IAuth, IGoods, IRole } from '@/interface';
import { resolveApp } from '@/utils';

export const initUser = {
  admin: {
    id: 1,
    username: 'admin',
    password: getRandomString(6),
    avatar: 'https://resource.hsslive.cn/live-livehss-cn/image/author.webp',
    user_roles: [3, 7],
    live_room: {
      id: 1,
      area: [1],
      name: '云烟成雨',
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_yycy.mp4'
          : resolveApp('./video/fddm_yycy.mp4'),
      base64: fddmYycyBase64,
      weight: 2,
    },
  },
  systemUser1: {
    id: 2,
    username: 'CoCo',
    password: getRandomString(6),
    user_roles: [5],
    avatar: 'https://resource.hsslive.cn/live-livehss-cn/image/CoCo.webp',
    live_room: {
      id: 2,
      name: '美好事物',
      area: [1],
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_mhsw.mp4'
          : resolveApp('./video/fddm_mhsw.mp4'),
      base64: fddmMhswBase64,
      weight: 1,
    },
  },
  systemUser2: {
    id: 3,
    username: 'Dukoo',
    password: getRandomString(6),
    avatar: 'https://resource.hsslive.cn/live-livehss-cn/image/Dukoo.webp',
    user_roles: [5],
    live_room: {
      id: 3,
      name: '和宇宙的温柔关联',
      area: [1],
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_hyzdwmgl.mp4'
          : resolveApp('./video/fddm_hyzdwmgl.mp4'),
      base64: fddmHyzdwmglBase64,
      weight: 1,
    },
  },
  systemUser3: {
    id: 4,
    username: 'MoonTIT',
    password: getRandomString(6),
    avatar: 'https://resource.hsslive.cn/live-livehss-cn/image/MoonTIT.webp',
    user_roles: [5],
    live_room: {
      id: 4,
      name: '所念皆星河',
      area: [1],
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_snjxh.mp4'
          : resolveApp('./video/fddm_snjxh.mp4'),
      base64: fddmSnjxhBase64,
      weight: 1,
    },
  },
  systemUser4: {
    id: 5,
    username: 'Nill',
    password: getRandomString(6),
    avatar: 'https://resource.hsslive.cn/live-livehss-cn/image/Nill.webp',
    user_roles: [5],
    live_room: {
      id: 5,
      name: '你是我为数不多的骄傲',
      area: [1],
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_nswwsbddja.mp4'
          : resolveApp('./video/fddm_nswwsbddja.mp4'),
      base64: fddmNswwsbddjaBase64,
      weight: 10,
    },
  },
  systemUser5: {
    id: 6,
    username: 'Ojin',
    password: getRandomString(6),
    avatar: 'https://resource.hsslive.cn/live-livehss-cn/image/Ojin.webp',
    user_roles: [5],
    live_room: {
      id: 6,
      name: '下一站茶山刘',
      area: [1],
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_xyzcsl.mp4'
          : resolveApp('./video/fddm_xyzcsl.mp4'),
      base64: fddmXyzcslBase64,
      weight: 1,
    },
  },
};

export const bulkCreateArea: IArea[] = [
  {
    id: 1,
    name: '音乐',
    remark: '音乐分区',
    weight: 10,
  },
  {
    id: 2,
    name: '知识',
    remark: '知识分区',
    weight: 9,
  },
  {
    id: 3,
    name: '手游',
    remark: '和平精英、王者荣耀',
    weight: 9,
  },
  {
    id: 4,
    name: '网游',
    remark: '英雄联盟、CS:GO、DOTA2',
    weight: 9,
  },
];

const initAuth = () => {
  const deafultAuth: IAuth[] = [
    {
      auth_name: '文章管理',
      auth_value: 'ARTICLE_MANAGE',
    },
    {
      auth_name: '评论管理',
      auth_value: 'COMMENT_MANAGE',
    },
    {
      auth_name: '点赞管理',
      auth_value: 'STAR_MANAGE',
    },
    {
      auth_name: '分类管理',
      auth_value: 'TYPE_MANAGE',
    },
    {
      auth_name: '标签管理',
      auth_value: 'TAG_MANAGE',
    },
    {
      auth_name: '友链管理',
      auth_value: 'LINK_MANAGE',
    },
    {
      auth_name: '音乐管理',
      auth_value: 'MUSIC_MANAGE',
    },
    {
      auth_name: '用户管理',
      auth_value: 'USER_MANAGE',
    },
    {
      auth_name: '角色管理',
      auth_value: 'ROLE_MANAGE',
    },
    {
      auth_name: '权限管理',
      auth_value: 'AUTH_MANAGE',
    },
    {
      auth_name: '主题管理',
      auth_value: 'THEME_MANAGE',
    },
    {
      auth_name: '作品管理',
      auth_value: 'WORK_MANAGE',
    },
    {
      auth_name: '设置管理',
      auth_value: 'SETTING_MANAGE',
    },
    {
      auth_name: '访客管理',
      auth_value: 'VISITOR_MANAGE',
    },
    {
      auth_name: '日志管理',
      auth_value: 'LOG_MANAGE',
    },
    {
      auth_name: '七牛云管理',
      auth_value: 'QINIU_MANAGE',
    },
    {
      auth_name: '任务管理',
      auth_value: 'TASK_MANAGE',
    },
  ];
  const authResult: IAuth[] = [];

  let id = 1;

  deafultAuth.forEach((v) => {
    const obj: IAuth = { ...v };
    id += 1;
    obj.id = id;
    obj.p_id = 1;
    obj.type = 1;
    obj.priority = 99;
    authResult.push(obj);
  });

  authResult.unshift({
    auth_name: '全部权限',
    auth_value: 'ALL_AUTH',
    id: 1,
    p_id: 0,
    type: 1,
    priority: 99,
  });
  return authResult;
};

const initRole = () => {
  const deafultRole: IRole[] = [
    {
      role_name: '管理员',
      role_value: 'ADMIN',
    },
    {
      role_name: '超级管理员',
      role_value: 'SUPER_ADMIN',
    },
    {
      role_name: '用户',
      role_value: 'USER',
    },
    {
      role_name: 'VIP用户',
      role_value: 'VIP_USER',
    },
    {
      role_name: '游客',
      role_value: 'TOURIST_USER',
    },
    {
      role_name: '开发部门',
      role_value: 'DEVELOP',
    },
    {
      role_name: '前端组',
      role_value: 'FRONTEND	',
    },
    {
      role_name: '前端实习',
      role_value: 'FRONTEND_TRAINEE',
    },
    {
      role_name: '前端经理',
      role_value: 'FRONTEND_MANAGER',
    },
    {
      role_name: '后端组',
      role_value: 'BACKEND',
    },
    {
      role_name: '业务部门',
      role_value: 'BUSINESS',
    },
    {
      role_name: '产品',
      role_value: 'PRODUCT',
    },
    {
      role_name: '运营',
      role_value: 'OPERATE',
    },
  ];
  const roleResult: IRole[] = [];

  let id = 1;

  deafultRole.forEach((v) => {
    const obj: IAuth = { ...v };
    id += 1;
    obj.id = id;
    obj.p_id = 1;
    obj.type = 1;
    obj.priority = 99;
    roleResult.push(obj);
  });

  roleResult.unshift({
    role_name: '全部角色',
    role_value: 'ALL_ROLE',
    id: 1,
    p_id: 0,
    type: 1,
    priority: 99,
  });
  return roleResult;
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
  return roleAuth;
};

export const bulkCreateGoods: IGoods[] = [
  {
    type: GoodsTypeEnum.gift,
    name: '鲜花',
    desc: '一朵鲜花',
    short_desc: '鲜花',
    price: '0.00',
    original_price: '0.00',
    badge: 'free',
    badge_bg: 'pink',
    remark: '',
    nums: 1,
    cover:
      'https://resource.hsslive.cn/image/c5258ebf3a79c7d67ef8ae95062c8fe4.webp',
  },
  {
    type: GoodsTypeEnum.gift,
    name: '可乐',
    desc: '肥宅快乐水',
    short_desc: '可乐',
    price: '2.00',
    original_price: '2.00',
    badge: '新品',
    badge_bg: '#e60c0d',
    remark: '',
    nums: 1,
    cover:
      'https://resource.hsslive.cn/image/3f56506ae5f536864dbc92b52c355bfe.webp',
  },
  {
    type: GoodsTypeEnum.gift,
    name: '大鸡腿',
    desc: '美味的大鸡腿，谁顶得住？',
    short_desc: '大鸡腿',
    price: '5.00',
    original_price: '5.00',
    badge: '',
    badge_bg: '',
    remark: '',
    nums: 1,
    cover:
      'https://resource.hsslive.cn/image/3f4e7debdc978741f90515ace48aee22.webp',
  },
  {
    type: GoodsTypeEnum.gift,
    name: '一杯咖啡',
    desc: '给阿姨倒一杯卡布奇诺',
    short_desc: '一杯咖啡',
    price: '10.00',
    original_price: '10.00',
    badge: '肝！',
    badge_bg: '#cda8a1',
    remark: '',
    nums: 1,
    cover:
      'https://resource.hsslive.cn/image/d9770d31ac7350556103c0b1ed09e01d.webp',
  },
  {
    type: GoodsTypeEnum.sponsors,
    name: '一根辣条',
    desc: '卫龙牌辣条',
    short_desc: '一根辣条',
    price: '0.10',
    original_price: '0.10',
    badge: '',
    badge_bg: '',
    remark: '',
    nums: 1,
    cover:
      'https://resource.hsslive.cn/image/7170e9bbf14b8dcda73e30ccff589132.webp',
  },
  {
    type: GoodsTypeEnum.sponsors,
    name: '一根烤肠',
    desc: '一块钱的淀粉肠',
    short_desc: '一根烤肠',
    price: '1.00',
    original_price: '1.00',
    badge: '',
    badge_bg: '',
    remark: '',
    nums: 1,
    cover:
      'https://resource.hsslive.cn/image/ed2e20878ee3cd9d2f71a4c3714e82a9.webp',
  },
  {
    type: GoodsTypeEnum.sponsors,
    name: '一杯奶茶',
    desc: '一杯益禾堂烤奶',
    short_desc: '一杯奶茶',
    price: '10.00',
    original_price: '10.00',
    badge: '',
    badge_bg: '',
    remark: '',
    nums: 1,
    cover:
      'https://resource.hsslive.cn/image/7e9edac32a8d9e0b7ac0b9554eded85c.webp',
  },
  {
    type: GoodsTypeEnum.sponsors,
    name: '一杯咖啡',
    desc: '一杯星巴克咖啡',
    short_desc: '一杯咖啡',
    price: '25.00',
    original_price: '25.00',
    badge: '',
    badge_bg: '',
    remark: '',
    nums: 1,
    cover:
      'https://resource.hsslive.cn/image/8d4ac68c84b6d0cad754e15151869d71.webp',
  },
  {
    type: GoodsTypeEnum.sponsors,
    name: '肯德基全家桶',
    desc: '肯德基疯狂星期四，v我50！',
    short_desc: '肯德基全家桶',
    price: '50.00',
    original_price: '50.00',
    badge: 'crazy',
    badge_bg: '#cda8a1',
    remark: '',
    nums: 1,
    cover:
      'https://resource.hsslive.cn/image/fd04506d5b3167cf210bd875e5a97c8b.webp',
  },
  {
    type: GoodsTypeEnum.sponsors,
    name: '一顿海底捞',
    desc: '一起嗨，海底捞',
    short_desc: '一顿海底捞',
    price: '100.00',
    original_price: '100.00',
    badge: '',
    badge_bg: '',
    remark: '',
    nums: 1,
    cover:
      'https://resource.hsslive.cn/image/3f71039d061fb5b2dc4a2d835a5c66ca.webp',
  },
  {
    type: GoodsTypeEnum.support,
    name: '一对一解答（0.5小时）',
    desc: '包括但不限于billd-live相关的任何问题。',
    short_desc: '一对一解答（0.5小时）',
    price: '20.00',
    original_price: '25.00',
    badge: '新人优惠',
    badge_bg: '#8fcbee',
    remark: '',
    nums: 1,
    cover:
      'https://resource.hsslive.cn/image/def9f85caeb1bf7602ae1bc37f00b03d__FfyoWB.webp',
  },
  {
    type: GoodsTypeEnum.support,
    name: '一对一解答（1小时）',
    desc: '包括但不限于billd-live相关的任何问题。',
    short_desc: '一对一解答（1小时）',
    price: '50.00',
    original_price: '50.00',
    badge: '',
    badge_bg: '',
    remark: '',
    nums: 1,
    cover:
      'https://resource.hsslive.cn/image/959fdd1938b53cbb92108039f7b835e2__8ql7RY.webp',
  },
  {
    type: GoodsTypeEnum.support,
    name: '一对一解答（3小时）',
    desc: '包括但不限于billd-live相关的任何问题。',
    short_desc: '一对一解答（3小时）',
    price: '120.00',
    original_price: '150.00',
    badge: '',
    badge_bg: '',
    remark: '',
    nums: 1,
    cover:
      'https://resource.hsslive.cn/image/d664a7e785e26dd5bd6d34559c2623d1__lZU2GY.webp',
  },
  {
    type: GoodsTypeEnum.recharge,
    name: '自定义充值',
    desc: '自定义充值',
    short_desc: '自定义充值',
    price: '0.00',
    original_price: '0.00',
    badge: '',
    badge_bg: '',
    remark: '',
    nums: 1,
    cover: '',
  },
];

export const bulkCreateRole = initRole();
export const bulkCreateAuth = initAuth();
export const bulkCreateRoleAuth = initRoleAuth();
