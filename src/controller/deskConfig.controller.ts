import deskConfigService from '@/service/deskConfig.service';

class DeskConfigController {
  common = {
    findByType: (type) => {
      return deskConfigService.findByType(type);
    },
  };
}
export default new DeskConfigController();
