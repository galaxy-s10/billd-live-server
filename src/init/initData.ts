import {
  IAuth,
  IFrontend,
  IInteractionStatis,
  InteractionStatisType,
} from '@/interface';

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
  const authResult: any = [];

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
  const defaultRole = [
    {
      id: 1,
      role_name: '全部角色',
      role_value: 'ALL_ROLE',
      type: 1,
      priority: 99,
      p_id: 0,
    },
    {
      id: 2,
      role_name: '管理员',
      role_value: 'ADMIN',
      type: 1,
      priority: 99,
      p_id: 1,
    },
    {
      id: 3,
      role_name: '超级管理员',
      role_value: 'SUPER_ADMIN',
      type: 1,
      priority: 99,
      p_id: 2,
    },
    {
      id: 4,
      role_name: '用户',
      role_value: 'USER',
      type: 1,
      priority: 99,
      p_id: 1,
    },
    {
      id: 5,
      role_name: 'VIP用户',
      role_value: 'VIP_USER',
      type: 1,
      priority: 99,
      p_id: 4,
    },
    {
      id: 6,
      role_name: '游客',
      role_value: 'TOURIST_USER',
      type: 1,
      priority: 99,
      p_id: 4,
    },
    {
      id: 7,
      role_name: '开发部门',
      role_value: 'DEVELOP',
      type: 1,
      priority: 99,
      p_id: 1,
    },
    {
      id: 8,
      role_name: '前端组',
      role_value: 'FRONTEND	',
      type: 1,
      priority: 99,
      p_id: 7,
    },
    {
      id: 9,
      role_name: '前端实习',
      role_value: 'FRONTEND_TRAINEE',
      type: 1,
      priority: 99,
      p_id: 8,
    },
    {
      id: 10,
      role_name: '前端经理',
      role_value: 'FRONTEND_MANAGER',
      type: 1,
      priority: 99,
      p_id: 8,
    },
    {
      id: 11,
      role_name: '后端组',
      role_value: 'BACKEND',
      type: 1,
      priority: 99,
      p_id: 7,
    },
    {
      id: 12,
      role_name: '业务部门',
      role_value: 'BUSINESS',
      type: 1,
      priority: 99,
      p_id: 1,
    },
    {
      id: 13,
      role_name: '产品',
      role_value: 'PRODUCT',
      type: 1,
      priority: 99,
      p_id: 12,
    },
    {
      id: 14,
      role_name: '运营',
      role_value: 'OPERATE',
      type: 1,
      priority: 99,
      p_id: 12,
    },
  ];
  return defaultRole;
};

const initRoleAuth = () => {
  const auth: any = initAuth();
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

const initFrontend = (): IFrontend[] => [
  {
    key: 'allow_qq_login',
    value: '1',
    desc: "是否开启qq登录（'1'开启；'2'关闭）",
    type: 'switch',
  },
  {
    key: 'allow_github_login',
    value: '1',
    desc: "是否开启github登录（'1'开启；'2'关闭）",
    type: 'switch',
  },
  {
    key: 'allow_email_login',
    value: '1',
    desc: "是否开启email登录（'1'开启；'2'关闭）",
    type: 'switch',
  },
  {
    key: 'allow_comment',
    value: '1',
    desc: "是否开启留言（'1'开启；'2'关闭）",
    type: 'switch',
  },
  {
    key: 'allow_link',
    value: '1',
    desc: "是否开启友链（'1'开启；'2'关闭）",
    type: 'switch',
  },
  {
    key: 'allow_shutdown_modal',
    value: '2',
    desc: "是否开启停机弹窗（'1'开启；'2'关闭）",
    type: 'switch',
  },
  {
    key: 'shutdown_modal_content',
    value: '停机中，预计30分钟左右恢复',
    desc: '停机弹窗内容',
    type: 'markdown',
  },
  {
    key: 'allow_home_modal',
    value: '2',
    desc: "是否开启首页弹窗（'1'开启；'2'关闭）",
    type: 'switch',
  },
  {
    key: 'home_modal_content',
    value: '今天是元旦节，祝大家元旦快乐',
    desc: '首页弹窗内容',
    type: 'markdown',
  },
  {
    key: 'about_me',
    value: '',
    desc: '关于我',
    type: 'markdown',
  },
];

const initInteractionStatis = (): IInteractionStatis[] => [
  {
    key: 'historyHightOnlineNum',
    value: JSON.stringify({}),
    desc: '历史最高同时在线（游客+用户）',
    type: InteractionStatisType.historyInfo,
  },
];

export const bulkCreateAuth = initAuth();
export const bulkCreateRole = initRole();
export const bulkCreateRoleAuth = initRoleAuth();
export const bulkFrontend = initFrontend();
export const bulkInteractionStatis = initInteractionStatis();
