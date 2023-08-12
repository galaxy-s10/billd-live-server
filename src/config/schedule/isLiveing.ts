export const handleRoomIsLiving = async () => {
  // async function handleExpired(liveId) {
  //   const flag = await LiveRedisController.getAnchorLiving({
  //     liveRoomId: -1,
  //   });
  //   if (!flag) {
  //     liveController.common.delete(liveId);
  //   }
  // }
  // try {
  //   const res = await liveController.common.getList({});
  //   res.rows.forEach((item) => {
  //     // 不对系统直播和obs直播做处理
  //     if (
  //       item.live_room?.type !== LiveRoomTypeEnum.system &&
  //       item.live_room?.type !== LiveRoomTypeEnum.user_obs
  //     ) {
  //       handleExpired(item.id);
  //     }
  //     if (!item.user_id || !item.live_room_id) {
  //       liveController.common.delete(item.id || -1);
  //     }
  //   });
  // } catch (error) {
  //   console.log(error);
  // }
};
