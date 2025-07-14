import authModel from '@/model/auth.model';
import roleAuthModel from '@/model/roleAuth.model';

class RoleAuthService {
  async getList() {
    const result = await roleAuthModel.findAndCountAll({
      include: authModel,
      distinct: true,
    });
    return result;
  }
}

export default new RoleAuthService();
