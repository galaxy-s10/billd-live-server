import { arrayUnique, getArrayDifference } from 'billd-utils';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE, PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import { IAuth, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import authService from '@/service/auth.service';
import roleService from '@/service/role.service';
import { arrayToTree } from '@/utils';

class AuthController {
  common = {
    getUserAuth: async (userId: number) => {
      const myAllRole = await roleService.getUserRole(userId);
      const queue: Promise<any>[] = [];
      myAllRole.forEach((item) => {
        queue.push(roleService.getRoleAuth(item.id!));
      });
      const queueRes = await Promise.all(queue);
      const res: IAuth[] = [];
      queueRes.forEach((item) => {
        res.push(...item);
      });
      return res;
    },
  };

  async commonGetAllChildAuth(id) {
    const allAuth: any = [];
    const queue: any = [];
    // eslint-disable-next-line no-shadow
    const getChildAuth = async (_id: number) => {
      const c: any = await authService.findAllChildren(_id);
      if (c.length > 0) allAuth.push(...c);
      for (let i = 0; i < c.length; i += 1) {
        const item = c[i];
        queue.push(getChildAuth(item.id));
      }
    };
    await getChildAuth(id);
    await Promise.all(queue);
    return allAuth;
  }

  /** 获取我的权限 */
  getMyAuth = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, msg } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success) {
      throw new CustomError(msg, code, code);
    }
    const res = await this.common.getUserAuth(userInfo!.id!);
    successHandler({ ctx, data: res });
    await next();
  };

  /** 获取某个用户的权限 */
  getUserAuth = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const res = await this.common.getUserAuth(id);
    successHandler({ ctx, data: res });
    await next();
  };

  // 权限列表（分页）
  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IAuth> = ctx.request.query;
    const result = await authService.getList({
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });
    await next();
  }

  // 权限列表（不分页）
  async getAllList(ctx: ParameterizedContext, next) {
    const result = await authService.getAllList();
    successHandler({ ctx, data: result });
    await next();
  }

  // 获取所有权限（树型）
  async getTreeAuth(ctx: ParameterizedContext, next) {
    const { id = '0' } = ctx.request.query;
    if (Number.isNaN(+id)) {
      throw new Error('id格式不对');
    }
    const { rows } = await authService.getAllList();
    const result = arrayToTree({
      originArr: rows as any,
      originPid: +id,
      originIdKey: 'id',
      originPidKey: 'p_id',
      resChildrenKey: 'children',
      // resIdKey: 'id',
      // resPidKey: 'pid',
    });
    successHandler({ ctx, data: result });
    await next();
  }

  // 获取除了父级以外的所有权限（树型）
  async getTreeChildAuth(ctx: ParameterizedContext, next) {
    // id是指根节点的id，不是根节点的p_id(因为根节点的p_id是null，其他节点的p_id是也可能是null)
    const { rows } = await authService.getPidNotNullAuth();
    const result = arrayToTree({
      originArr: rows,
      originPid: 1,
      originIdKey: 'id',
      originPidKey: 'p_id',
      resChildrenKey: 'children',
      // resIdKey: 'id',
      // resPidKey: 'pid',
    });
    successHandler({ ctx, data: result });
    await next();
  }

  // 查找权限
  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await authService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  // 获取该权限的子权限（只找一层）
  getChildAuth = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const isExist = await authService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的权限！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const result = await authService.findByPid(id);
    successHandler({ ctx, data: { total: result.length, result } });
    await next();
  };

  // 获取该权限的子权限（递归查找所有）
  getAllChildAuth = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const isExist = await authService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的权限！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const result = await this.commonGetAllChildAuth(id);
    successHandler({ ctx, data: { total: result.length, result } });
    await next();
  };

  // 创建权限
  async create(ctx: ParameterizedContext, next) {
    const {
      p_id,
      auth_name,
      auth_value,
      type = 2,
      priority = 1,
    }: IAuth = ctx.request.body;
    if (!p_id) {
      throw new CustomError(
        'p_id不能为空！',
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const isExist = p_id === 0 ? false : await authService.isExist([p_id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${p_id}的权限！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await authService.create({
      p_id,
      auth_name,
      auth_value,
      type,
      priority,
    });
    successHandler({ ctx });
    await next();
  }

  // 更新权限
  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    if (PROJECT_ENV === PROJECT_ENV_ENUM.beta) {
      const role: any = await authService.find(id);
      if (role.type === 1) {
        throw new CustomError(
          '测试环境不能操作默认权限！',
          COMMON_HTTP_CODE.forbidden,
          COMMON_HTTP_CODE.forbidden
        );
      }
    }

    const { p_id, auth_name, auth_value, type, priority }: IAuth =
      ctx.request.body;
    if (!p_id) {
      throw new CustomError(
        `p_id不能为空！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (id === 1 && p_id !== 0) {
      throw new CustomError(
        `不能修改根权限的p_id哦！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (id === p_id) {
      throw new CustomError(
        `父权限不能等于子权限！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (id === 1) {
      await authService.update({
        id,
        p_id,
        auth_name,
        auth_value,
        type,
        priority,
      });
    } else {
      const isExist = await authService.isExist([id, p_id]);
      if (!isExist) {
        throw new CustomError(
          `${[id, p_id].toString()}中存在不存在的权限！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      const c_auth: any = await authService.find(p_id);
      if (id !== 1 && c_auth.p_id === id) {
        throw new CustomError(
          `不能将自己的子权限作为父权限！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      await authService.update({
        id,
        p_id,
        auth_name,
        auth_value,
        type,
        priority,
      });
    }

    successHandler({ ctx });
    await next();
  }

  // 删除权限
  delete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    if (PROJECT_ENV === PROJECT_ENV_ENUM.beta) {
      const role: any = await authService.find(id);
      if (role.type === 1) {
        throw new CustomError(
          '测试环境不能操作默认权限！',
          COMMON_HTTP_CODE.forbidden,
          COMMON_HTTP_CODE.forbidden
        );
      }
    }
    if (id === 1) {
      throw new Error(`不能删除根权限哦！`);
    }
    const auth: any = await authService.find(id);
    if (!auth) {
      throw new Error(`不存在id为${id}的权限！`);
    }
    const result: any[] = await this.commonGetAllChildAuth(id);
    await authService.delete([id, ...result.map((v) => v.id)]);
    successHandler({
      ctx,
      msg: `删除成功，且删除了${result.length}个关联权限`,
    });
    await next();
  };

  // 批量新增子权限
  batchAddChildAuths = async (ctx: ParameterizedContext, next) => {
    const { id, c_auths }: IAuth = ctx.request.body;
    if (!id) {
      throw new CustomError(
        `id不能为空！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (PROJECT_ENV === PROJECT_ENV_ENUM.beta) {
      const role: any = await authService.find(id);
      if (role.type === 1) {
        throw new CustomError(
          '测试环境不能操作默认权限！',
          COMMON_HTTP_CODE.forbidden,
          COMMON_HTTP_CODE.forbidden
        );
      }
    }
    if (id === undefined) {
      throw new Error(`请传入id！`);
    }
    if (!c_auths || !c_auths.length) {
      throw new Error(`请传入要新增的子权限！`);
    }
    if (c_auths.includes(id)) {
      throw new Error(`父级权限不能在子权限里面！`);
    }
    const isExist = await authService.isExist([id, ...c_auths]);
    if (!isExist) {
      throw new Error(`${[id, ...c_auths].toString()}中存在不存在的权限！`);
    }
    const result1: any = await authService.findAllByInId(c_auths);
    const result2: number[] = result1.map((v) => v.p_id);
    const isUnique = arrayUnique(result2).length === 1;
    if (!isUnique) {
      throw new Error(`${c_auths.toString()}不是同一个父级权限！`);
    }
    await authService.updateMany(c_auths, id);
    successHandler({ ctx });
    await next();
  };

  // 批量删除子权限
  batchDeleteChildAuths = async (ctx: ParameterizedContext, next) => {
    const { id, c_auths }: IAuth = ctx.request.body;
    if (!id) {
      throw new CustomError(
        `id不能为空！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (PROJECT_ENV === PROJECT_ENV_ENUM.beta) {
      const role: any = await authService.find(id);
      if (role.type === 1) {
        throw new CustomError(
          `测试环境不能操作默认权限！`,
          COMMON_HTTP_CODE.forbidden,
          COMMON_HTTP_CODE.forbidden
        );
      }
    }
    if (id === undefined) {
      throw new CustomError(
        `请传入id！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (!c_auths || !c_auths.length) {
      throw new CustomError(
        `请传入要删除的子权限！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const isExist = await authService.isExist([id, ...c_auths]);
    if (!isExist) {
      throw new CustomError(
        `${[id, ...c_auths].toString()}中存在不存在的权限！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const all_child_auths: any = await authService.findByPid(id);
    const all_child_auths_id = all_child_auths.map((v) => v.id);
    const hasDiff = getArrayDifference(c_auths, all_child_auths_id);
    if (hasDiff.length) {
      throw new CustomError(
        `${c_auths.toString()}中的权限父级id不是${id}！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const queue: any = [];
    c_auths.forEach((v) => {
      queue.push(this.commonGetAllChildAuth(v));
    });
    // 这是个二维数组
    const authRes = await Promise.all(queue);
    // 将二维数组拍平
    const authResFlat = authRes.flat();
    await authService.delete([...authResFlat.map((v) => v.id), ...c_auths]);
    successHandler({
      ctx,
      msg: `删除成功，删除了${c_auths.length}个子权限和${authResFlat.length}个关联权限`,
    });
    await next();
  };
}

export default new AuthController();
