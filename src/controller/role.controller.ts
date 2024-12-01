import { arrayUnique, getArrayDifference } from 'billd-utils';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE } from '@/constant';
import { IList, IRole } from '@/interface';
import { CustomError } from '@/model/customError.model';
import authService from '@/service/auth.service';
import roleService from '@/service/role.service';
import { arrayToTree } from '@/utils';

class RoleController {
  common = {
    async getAllChildRole(id: number) {
      const queue: Array<Promise<IRole[]>> = [];
      const result: IRole[] = [];
      const getChildRole = async (_id: number): Promise<IRole[]> => {
        const res: IRole[] = await roleService.findAllChildren(_id);
        for (let i = 0; i < res.length; i += 1) {
          const item = res[i];
          queue.push(getChildRole(item.id!));
        }
        return res;
      };
      const wrap = await getChildRole(id);
      wrap.forEach((v) => {
        result.push(v);
      });
      const res = await Promise.all(queue);
      res.forEach((item) => {
        item.forEach((iten) => {
          result.push(iten);
        });
      });
      return result;
    },
    getUserAllRole: async (userId: number) => {
      const result = await roleService.getUserRole(userId);
      const role: Array<Promise<IRole[]>> = [];
      result.forEach((v) => {
        role.push(this.common.getAllChildRole(v.id!));
      });
      // 这是个二维数组
      const roleRes = await Promise.all(role);
      // 将二维数组拍平
      // const roleResFlat = roleRes.reduce((a, b) => a.concat(b), []);
      const roleResFlat = roleRes.flat();
      return [...result, ...roleResFlat];
    },
  };

  async getAllList(ctx: ParameterizedContext, next) {
    const {
      id,
      type,
      orderBy,
      orderName,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IRole> = ctx.request.query;
    const result = await roleService.getAllList({
      id,
      type,
      orderBy,
      orderName,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      type,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IRole> = ctx.request.query;
    const result = await roleService.getList({
      id,
      type,
      nowPage,
      pageSize,
      orderBy,
      orderName,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  // 获取所有角色（树型）
  async getTreeRole(ctx: ParameterizedContext, next) {
    const {
      id = 0,
      orderBy,
      orderName,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IRole> = ctx.request.query;
    if (Number.isNaN(+id)) {
      throw new CustomError(
        `id格式不对`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const { rows } = await roleService.getAllList({
      orderBy,
      orderName,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
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

  // 获取除了父级以外的所有角色（树型）
  async getTreeChildRole(ctx: ParameterizedContext, next) {
    // id是指根节点的id，不是根节点的p_id(因为根节点的p_id是null，其他节点的p_id是也可能是null)
    const { rows } = await roleService.getPidNotNullRole();
    const result = arrayToTree({
      originArr: rows,
      // @ts-ignore
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

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await roleService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  // 获取某个角色的权限
  async getRoleAuth(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await roleService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的角色！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const result = await roleService.getRoleAuth(id);
    successHandler({ ctx, data: { total: result.length, result } });
    await next();
  }

  // 获取某个角色的权限（递归找所有）
  async getAllRoleAuth(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await roleService.getRoleAuth(id);
    successHandler({ ctx, data: { total: result.length, result } });
    await next();
  }

  // 获取某个用户的角色
  async getUserRole(ctx: ParameterizedContext, next) {
    const userId = +ctx.params.user_id;
    const result = await roleService.getUserRole(userId);
    successHandler({ ctx, data: { total: result.length, result } });
    await next();
  }

  // 获取我的角色
  getMyRole = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, msg } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success) {
      throw new CustomError(msg, code, code);
    }
    const result = await roleService.getUserRole(userInfo!.id!);
    successHandler({ ctx, data: { total: result.length, result } });
    await next();
  };

  // 获取我的角色（递归找所有）
  getMyAllRole = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, msg } = await authJwt(ctx);
    if (code !== COMMON_HTTP_CODE.success) {
      throw new CustomError(msg, code, code);
    }
    const result = await this.common.getUserAllRole(userInfo!.id!);
    successHandler({ ctx, data: result });
    await next();
  };

  // 获取某个用户的角色（递归找所有）
  getUserAllRole = async (ctx: ParameterizedContext, next) => {
    const userId = +ctx.params.user_id;
    const result = await this.common.getUserAllRole(userId);
    successHandler({ ctx, data: result });
    await next();
  };

  // 获取该角色的子角色（递归查找所有）
  getAllChildRole = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const isExist = await roleService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的角色！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const result = await this.common.getAllChildRole(id);
    successHandler({ ctx, data: { total: result.length, result } });

    await next();
  };

  /** 获取该角色的子角色（只找一层） */
  getChildRole = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const isExist = await roleService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的角色！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const result = await roleService.findByPid(id);
    successHandler({ ctx, data: { total: result.length, result } });

    await next();
  };

  // 修改某个角色的权限
  async updateRoleAuth(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const { role_auths }: IRole = ctx.request.body;
    if (!role_auths) {
      throw new CustomError(
        `role_auths不能为空`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const isExistRole = await roleService.isExist([id]);
    if (!isExistRole) {
      throw new CustomError(
        `不存在id为${id}的角色！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const isExistAuth =
      role_auths.length === 0 ? true : await authService.isExist(role_auths);
    if (!isExistAuth) {
      throw new CustomError(
        `${role_auths.toString()}中存在不存在的权限！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const role: any = await roleService.find(id);
    role.setAuths(role_auths);
    successHandler({ ctx });

    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const { p_id, role_name, role_value, type, priority }: IRole =
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
        `不能修改根角色的p_id！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (id === p_id) {
      throw new CustomError(
        `父角色不能等于子角色！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (id === 1) {
      await roleService.update({
        id,
        p_id,
        role_name,
        role_value,
        type,
        priority,
      });
    } else {
      const isExist = await roleService.isExist([id, p_id]);
      if (!isExist) {
        throw new CustomError(
          `${[id, p_id].toString()}中存在不存在的角色！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      const c_role: any = await roleService.find(p_id);
      if (id !== 1 && c_role.p_id === id) {
        throw new CustomError(
          `不能将自己的子角色作为父角色！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      await roleService.update({
        id,
        p_id,
        role_name,
        role_value,
        type,
        priority,
      });
    }

    successHandler({ ctx });

    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const {
      p_id,
      role_name,
      role_value,
      type = 2,
      priority = 1,
    }: IRole = ctx.request.body;
    const isExist = p_id === 0 ? false : await roleService.isExist([p_id!]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${p_id!}的角色！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await roleService.create({
      p_id,
      role_name,
      role_value,
      type,
      priority,
    });
    successHandler({ ctx });

    await next();
  }

  // 批量删除子角色
  batchDeleteChildRoles = async (ctx: ParameterizedContext, next) => {
    const { id, c_roles }: IRole = ctx.request.body;
    if (!id) {
      throw new CustomError(
        `id不能为空！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (id === undefined) {
      throw new CustomError(
        `id不能为空！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (!c_roles || !c_roles.length) {
      throw new CustomError(
        `请传入要删除的子角色！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const isExist = await roleService.isExist([id, ...c_roles]);
    if (!isExist) {
      throw new CustomError(
        `${[id, ...c_roles].toString()}中存在不存在的角色！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const all_child_roles: any = await roleService.findByPid(id);
    const all_child_roles_id = all_child_roles.map((v) => v.id);
    const hasDiff = getArrayDifference(c_roles, all_child_roles_id);
    if (hasDiff.length) {
      throw new CustomError(
        `${c_roles.toString()}中的角色父级id不是${id}！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const queue: any = [];
    c_roles.forEach((v) => {
      queue.push(this.common.getAllChildRole(v));
    });
    // 这是个二维数组
    const roleRes = await Promise.all(queue);
    // 将二维数组拍平
    const roleResFlat = roleRes.flat();
    await roleService.delete([...roleResFlat.map((v) => v.id), ...c_roles]);
    successHandler({
      ctx,
      msg: `删除成功，删除了${c_roles.length}个子角色和${roleResFlat.length}个关联角色`,
    });

    await next();
  };

  // 批量新增子角色
  batchAddChildRoles = async (ctx: ParameterizedContext, next) => {
    const { id, c_roles }: IRole = ctx.request.body;
    if (!id) {
      throw new CustomError(
        `id不能为空！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (id === undefined) {
      throw new CustomError(
        `请传入id！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (!c_roles || !c_roles.length) {
      throw new CustomError(
        `请传入要新增的子角色！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    if (c_roles.includes(id)) {
      throw new CustomError(
        `父级角色不能在子角色里面！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const isExist = await roleService.isExist([id, ...c_roles]);
    if (!isExist) {
      throw new CustomError(
        `${[id, ...c_roles].toString()}中存在不存在的角色！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const result1: any = await roleService.findAllByInId(c_roles);
    const result2: number[] = result1.map((v) => v.p_id);
    const isUnique = arrayUnique(result2).length === 1;
    if (!isUnique) {
      throw new CustomError(
        `${c_roles.toString()}不是同一个父级角色！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await roleService.updateMany(c_roles, id);
    successHandler({ ctx });

    await next();
  };

  delete = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    if (id === 1) {
      throw new CustomError(
        `不能删除根角色！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const role: any = await roleService.find(id);
    if (!role) {
      throw new CustomError(
        `不存在id为${id}的角色！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    const auths = await role.getAuths();
    await role.removeAuths(auths); // 删除该角色的权限
    const result = await this.common.getAllChildRole(id);
    await roleService.delete([id, ...result.map((v) => v.id!)]);
    successHandler({
      ctx,
      msg: `删除成功，且删除了${result.length}个关联角色`,
    });

    await next();
  };
}

export default new RoleController();
