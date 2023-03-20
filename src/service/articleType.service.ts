import articleTypeModel from '@/model/dayData.model';

class ArticleTypeService {
  async create(props) {
    const res = await articleTypeModel.create(props);
    return res;
  }

  async getList() {
    const res = await articleTypeModel.findAndCountAll();
    return res;
  }
}

export default new ArticleTypeService();
