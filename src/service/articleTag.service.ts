import articleTagModel from '@/model/articleTag.model';

class ArticleTagService {
  async create(props) {
    const res = await articleTagModel.create(props);
    return res;
  }

  async getList() {
    const res = await articleTagModel.findAndCountAll();
    return res;
  }
}

export default new ArticleTagService();
