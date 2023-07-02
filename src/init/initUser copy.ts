import { getRandomString } from 'billd-utils';

import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import { fddmHyzdwmglBase64 } from '@/init/base64/fddm_hyzdwmgl';
import { fddmMhswBase64 } from '@/init/base64/fddm_mhsw';
import { fddmNswwsbddjaBase64 } from '@/init/base64/fddm_nswwsbddja';
import { fddmSnjxhBase64 } from '@/init/base64/fddm_snjxh';
import { fddmXyzcslBase64 } from '@/init/base64/fddm_xyzcsl';
import { fddmYcjhBase64 } from '@/init/base64/fddm_ycjh';
import { fddmYycyBase64 } from '@/init/base64/fddm_yycy';
import { qlzJjbnxyBase64 } from '@/init/base64/qlz_jjbnxy';
import { zjlBnsdmmBase64 } from '@/init/base64/zjl_bnsdmm';
import { zjlGqBase64 } from '@/init/base64/zjl_gq';
import { zjlQtBase64 } from '@/init/base64/zjl_qt';
import { zjlYlxbBase64 } from '@/init/base64/zjl_ylxb';
import { resolveApp } from '@/utils';

export const initUser = {
  admin: {
    id: 1,
    username: 'admin',
    password: getRandomString(6),
    avatar: 'https://resource.hsslive.cn/live-livehss-cn/image/author.webp',
    user_roles: [3, 7],
    live_room: {
      devInitFFmpeg: true, // 开发模式初始化ffmpeg
      cdn: 1, // 1:使用cdn;2:不使用cdn
      id: 1,
      area: [1],
      name: '房东的猫-云烟成雨',
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
      devInitFFmpeg: true, // 开发模式初始化ffmpeg
      cdn: 2, // 1:使用cdn;2:不使用cdn
      id: 2,
      name: '房东的猫-美好事物',
      area: [1],
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_mhsw.mp4'
          : resolveApp('./video/fddm_mhsw.mp4'),
      base64: fddmMhswBase64,
      weight: 2,
    },
  },
  systemUser2: {
    id: 3,
    username: 'Dukoo',
    password: getRandomString(6),
    avatar: 'https://resource.hsslive.cn/live-livehss-cn/image/Dukoo.webp',
    user_roles: [5],
    live_room: {
      devInitFFmpeg: true, // 开发模式初始化ffmpeg
      cdn: 2, // 1:使用cdn;2:不使用cdn
      id: 3,
      name: '房东的猫-和宇宙的温柔关联',
      area: [1],
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_hyzdwmgl.mp4'
          : resolveApp('./video/fddm_hyzdwmgl.mp4'),
      base64: fddmHyzdwmglBase64,
      weight: 2,
    },
  },
  systemUser3: {
    id: 4,
    username: 'MoonTIT',
    password: getRandomString(6),
    avatar: 'https://resource.hsslive.cn/live-livehss-cn/image/MoonTIT.webp',
    user_roles: [5],
    live_room: {
      devInitFFmpeg: true, // 开发模式初始化ffmpeg
      cdn: 2, // 1:使用cdn;2:不使用cdn
      id: 4,
      name: '房东的猫-所念皆星河',
      area: [1],
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_snjxh.mp4'
          : resolveApp('./video/fddm_snjxh.mp4'),
      base64: fddmSnjxhBase64,
      weight: 2,
    },
  },
  systemUser4: {
    id: 5,
    username: 'Nill',
    password: getRandomString(6),
    avatar: 'https://resource.hsslive.cn/live-livehss-cn/image/Nill.webp',
    user_roles: [5],
    live_room: {
      devInitFFmpeg: false, // 开发模式初始化ffmpeg
      cdn: 1, // 1:使用cdn;2:不使用cdn
      id: 5,
      name: '房东的猫-你是我为数不多的骄傲',
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
      devInitFFmpeg: false, // 开发模式初始化ffmpeg
      cdn: 2, // 1:使用cdn;2:不使用cdn
      id: 6,
      name: '房东的猫-下一站茶山刘',
      area: [1],
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_xyzcsl.mp4'
          : resolveApp('./video/fddm_xyzcsl.mp4'),
      base64: fddmXyzcslBase64,
      weight: 2,
    },
  },
  systemUser6: {
    id: 7,
    username: 'user-7',
    password: getRandomString(6),
    avatar: '',
    user_roles: [5],
    live_room: {
      devInitFFmpeg: false, // 开发模式初始化ffmpeg
      cdn: 2, // 1:使用cdn;2:不使用cdn
      id: 7,
      name: '周杰伦-不能说的秘密',
      area: [1],
      localFile: '/node/video/zjl_bnsdmm.mp4',
      base64: zjlBnsdmmBase64,
      weight: 9,
    },
  },
  systemUser7: {
    id: 8,
    username: 'user-8',
    password: getRandomString(6),
    avatar: '',
    user_roles: [5],
    live_room: {
      devInitFFmpeg: false, // 开发模式初始化ffmpeg
      cdn: 2, // 1:使用cdn;2:不使用cdn
      id: 8,
      name: '周杰伦-晴天',
      area: [1],
      localFile: '/node/video/zjl_qt.mp4',
      base64: zjlQtBase64,
      weight: 2,
    },
  },
  systemUser8: {
    id: 9,
    username: 'user-9',
    password: getRandomString(6),
    avatar: '',
    user_roles: [5],
    live_room: {
      devInitFFmpeg: false, // 开发模式初始化ffmpeg
      cdn: 2, // 1:使用cdn;2:不使用cdn
      id: 9,
      name: '房东的猫-一次就好',
      area: [1],
      localFile: '/node/video/fddm_ycjh.mp4',
      base64: fddmYcjhBase64,
      weight: 2,
    },
  },
  systemUser9: {
    id: 10,
    username: 'user-10',
    password: getRandomString(6),
    avatar: '',
    user_roles: [5],
    live_room: {
      devInitFFmpeg: false, // 开发模式初始化ffmpeg
      cdn: 2, // 1:使用cdn;2:不使用cdn
      id: 10,
      name: '七龙珠-渐渐被你吸引',
      area: [1],
      localFile: '/node/video/qlz_jjbnxy.mp4',
      base64: qlzJjbnxyBase64,
      weight: 2,
    },
  },
  systemUser10: {
    id: 11,
    username: 'user-11',
    password: getRandomString(6),
    avatar: '',
    user_roles: [5],
    live_room: {
      devInitFFmpeg: false, // 开发模式初始化ffmpeg
      cdn: 2, // 1:使用cdn;2:不使用cdn
      id: 11,
      name: '周杰伦-搁浅',
      area: [1],
      localFile: '/node/video/zjl_gq.mp4',
      base64: zjlGqBase64,
      weight: 2,
    },
  },

  systemUser100: {
    id: 100,
    username: 'user-100',
    password: getRandomString(6),
    avatar: '',
    user_roles: [5],
    live_room: {
      devInitFFmpeg: false, // 开发模式初始化ffmpeg
      cdn: 2, // 1:使用cdn;2:不使用cdn
      id: 100,
      name: '周杰伦-一路向北',
      area: [1],
      localFile: '/node/video/zjl_ylxb.mp4',
      base64: zjlYlxbBase64,
      weight: 3,
    },
  },
};
