import liveModel from '@/model/live.model';

class DBController {
  /** 新增一个在线房间 */
  addLiveRoom = async ({ roomId = '-1', socketId = '-1', data = {} }) => {
    const res = await liveModel.create({
      roomId,
      socketId,
      data: JSON.stringify(data),
    });
    return res;
  };

  /** 删除一个在线房间 */
  deleteLiveRoom = async (socketId: string) => {
    const res = await liveModel.destroy({ where: { socketId } });
    return res;
  };

  /** 获取所有在线房间 */
  getAllLiveRoom = async () => {
    const res = await liveModel.findAndCountAll();
    return res;
  };

  /** 获取所有在线房间 */
  searchLiveRoomBySocketId = async (socketId: string) => {
    const res = await liveModel.findAndCountAll({ where: { socketId } });
    return res;
  };

  /** 获取所有在线房间 */
  searchLiveRoomByRoomId = async (roomId: string) => {
    const res = await liveModel.findAndCountAll({ where: { roomId } });
    return res;
  };
}

export default new DBController();
