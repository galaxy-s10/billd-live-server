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
import { IInitUser, LiveRoomPullIsShouldAuthEnum } from '@/interface';
import { resolveApp } from '@/utils';

import { hss_20230707_1_30Base64 } from './base64/hss_20230707_1_30';

export const initUser: Record<string, IInitUser> = {
  admin: {
    id: 1,
    username: 'admin',
    password: getRandomString(6),
    avatar:
      'https://resource.hsslive.cn/billd-live/image/def9f85caeb1bf7602ae1bc37f00b03d.webp',
    user_roles: [3, 7],
    live_room: {
      id: 1,
      name: '房东的猫-美好事物',
      weight: 2,
      cdn: 2, // 1:使用cdn;2:不使用cdn
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.no,
      area: [1],
      devFFmpeg: false, // 初始化ffmpeg
      prodFFmpeg: false, // 初始化ffmpeg
      cover_img: fddmMhswBase64,
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_mhsw.mp4'
          : resolveApp('/src/video/fddm_mhsw.mp4'),
    },
  },
  systemUser1: {
    id: 2,
    username: 'CoCo',
    password: getRandomString(6),
    user_roles: [5],
    avatar:
      'https://resource.hsslive.cn/billd-live/image/15a116a978cadb34e9fbf0061a4145bc.webp',
    live_room: {
      id: 2,
      name: '房东的猫-云烟成雨',
      weight: 10,
      cdn: 1, // 1:使用cdn;2:不使用cdn
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.no,
      area: [1],
      devFFmpeg: false, // 初始化ffmpeg
      prodFFmpeg: true, // 初始化ffmpeg
      cover_img: fddmYycyBase64,
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_yycy.mp4'
          : resolveApp('/src/video/fddm_yycy.mp4'),
    },
  },
  systemUser2: {
    id: 3,
    username: 'Dukoo',
    password: getRandomString(6),
    avatar:
      'https://resource.hsslive.cn/billd-live/image/752a40d44811c99278961410da656464.webp',
    user_roles: [5],
    live_room: {
      id: 3,
      name: '房东的猫-和宇宙的温柔关联',
      weight: 10,
      cdn: 2, // 1:使用cdn;2:不使用cdn
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.yes,
      area: [1],
      devFFmpeg: true, // 初始化ffmpeg
      prodFFmpeg: true, // 初始化ffmpeg
      cover_img: fddmHyzdwmglBase64,
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_hyzdwmgl.mp4'
          : resolveApp('/src/video/fddm_hyzdwmgl.mp4'),
    },
  },
  systemUser3: {
    id: 4,
    username: 'MoonTIT',
    password: getRandomString(6),
    avatar:
      'https://resource.hsslive.cn/billd-live/image/2b045c7f02febd23893244e923115535.webp',
    user_roles: [5],
    live_room: {
      id: 4,
      name: '房东的猫-所念皆星河',
      weight: 2,
      cdn: 2, // 1:使用cdn;2:不使用cdn
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.no,
      area: [1],
      devFFmpeg: false, // 初始化ffmpeg
      prodFFmpeg: true, // 初始化ffmpeg
      cover_img: fddmSnjxhBase64,
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_snjxh.mp4'
          : resolveApp('/src/video/fddm_snjxh.mp4'),
    },
  },
  systemUser4: {
    id: 5,
    username: 'Nill',
    password: getRandomString(6),
    avatar:
      'https://resource.hsslive.cn/billd-live/image/2142b19fe33e1fd7ed848104f64c4fd4.webp',
    user_roles: [5],
    live_room: {
      id: 5,
      name: '房东的猫-你是我为数不多的骄傲',
      weight: 3,
      cdn: 2, // 1:使用cdn;2:不使用cdn
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.yes,
      area: [1],
      devFFmpeg: true, // 初始化ffmpeg
      prodFFmpeg: true, // 初始化ffmpeg
      cover_img: fddmNswwsbddjaBase64,
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_nswwsbddja.mp4'
          : resolveApp('/src/video/fddm_nswwsbddja.mp4'),
    },
  },
  systemUser5: {
    id: 6,
    username: 'Ojin',
    password: getRandomString(6),
    avatar:
      'https://resource.hsslive.cn/billd-live/image/7e048083bb5dccde76018625b644c84b.webp',
    user_roles: [5],
    live_room: {
      id: 6,
      name: '房东的猫-下一站茶山刘',
      weight: 2,
      cdn: 2, // 1:使用cdn;2:不使用cdn
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.no,
      area: [1],
      devFFmpeg: true, // 初始化ffmpeg
      prodFFmpeg: true, // 初始化ffmpeg
      cover_img: fddmXyzcslBase64,
      localFile:
        PROJECT_ENV === PROJECT_ENV_ENUM.prod
          ? '/node/video/fddm_xyzcsl.mp4'
          : resolveApp('/src/video/fddm_xyzcsl.mp4'),
    },
  },
  systemUser6: {
    id: 7,
    username: 'user-7',
    password: getRandomString(6),
    avatar: '',
    user_roles: [5],
    live_room: {
      id: 7,
      name: '周杰伦-不能说的秘密',
      weight: 9,
      cdn: 2, // 1:使用cdn;2:不使用cdn
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.no,
      area: [1],
      devFFmpeg: false, // 初始化ffmpeg
      prodFFmpeg: true, // 初始化ffmpeg
      cover_img: zjlBnsdmmBase64,
      localFile: '/node/video/zjl_bnsdmm.mp4',
    },
  },
  systemUser7: {
    id: 8,
    username: 'user-8',
    password: getRandomString(6),
    avatar: '',
    user_roles: [5],
    live_room: {
      id: 8,
      name: '周杰伦-晴天',
      weight: 2,
      cdn: 2, // 1:使用cdn;2:不使用cdn
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.no,
      area: [1],
      devFFmpeg: false, // 初始化ffmpeg
      prodFFmpeg: false, // 初始化ffmpeg
      cover_img: zjlQtBase64,
      localFile: '/node/video/zjl_qt.mp4',
    },
  },
  systemUser8: {
    id: 9,
    username: 'user-9',
    password: getRandomString(6),
    avatar: '',
    user_roles: [5],
    live_room: {
      id: 9,
      name: '房东的猫-一次就好',
      weight: 2,
      cdn: 2, // 1:使用cdn;2:不使用cdn
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.no,
      area: [1],
      devFFmpeg: false, // 初始化ffmpeg
      prodFFmpeg: true, // 初始化ffmpeg
      cover_img: fddmYcjhBase64,
      localFile: '/node/video/fddm_ycjh.mp4',
    },
  },
  systemUser9: {
    id: 10,
    username: 'user-10',
    password: getRandomString(6),
    avatar: '',
    user_roles: [5],
    live_room: {
      id: 10,
      name: '七龙珠-渐渐被你吸引',
      weight: 2,
      cdn: 2, // 1:使用cdn;2:不使用cdn
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.no,
      area: [1],
      devFFmpeg: false, // 初始化ffmpeg
      prodFFmpeg: true, // 初始化ffmpeg
      cover_img: qlzJjbnxyBase64,
      localFile: '/node/video/qlz_jjbnxy.mp4',
    },
  },
  systemUser10: {
    id: 11,
    username: 'user-11',
    password: getRandomString(6),
    avatar: '',
    user_roles: [5],
    live_room: {
      id: 11,
      name: '周杰伦-搁浅',
      weight: 2,
      cdn: 2, // 1:使用cdn;2:不使用cdn
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.no,
      area: [1],
      devFFmpeg: false, // 初始化ffmpeg
      prodFFmpeg: false, // 初始化ffmpeg
      cover_img: zjlGqBase64,
      localFile: '/node/video/zjl_gq.mp4',
    },
  },
  systemUser11: {
    id: 12,
    username: 'user-12',
    password: getRandomString(6),
    avatar: '',
    user_roles: [5],
    live_room: {
      id: 12,
      name: 'billd-live付费课',
      weight: 20,
      cdn: 2, // 1:使用cdn;2:不使用cdn
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.no,
      area: [1],
      devFFmpeg: false, // 初始化ffmpeg
      prodFFmpeg: true, // 初始化ffmpeg
      cover_img: hss_20230707_1_30Base64,
      localFile: '/node/video/hss_20230707_1_30.mp4',
    },
  },
  systemUser100: {
    id: 100,
    username: 'user-100',
    password: getRandomString(6),
    avatar: '',
    user_roles: [5],
    live_room: {
      id: 100,
      name: '周杰伦-一路向北',
      weight: 3,
      cdn: 2, // 1:使用cdn;2:不使用cdn
      pull_is_should_auth: LiveRoomPullIsShouldAuthEnum.no,
      area: [1],
      devFFmpeg: false, // 初始化ffmpeg
      prodFFmpeg: true, // 初始化ffmpeg
      cover_img: zjlYlxbBase64,
      localFile: '/node/video/zjl_ylxb.mp4',
    },
  },
};
