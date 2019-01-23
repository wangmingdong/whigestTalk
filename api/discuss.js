import UI from "../utils/uiUtil";
import Net from "../utils/netUtil";
import Config from "../config";
const app = getApp()

export default class DiscussSev {


  /**
  * 查询评论列表
  */
  static getDiscussList(data) {
    return Net.postJSON(Config.SERVER.url.root + "/discuss/queryDiscussByCommentId", {}, data);
  }

  /**
   * 根据commentId查询详情
   */
  static findCommentByCommentId(id) {
    return Net.getJSON(Config.SERVER.url.root + "/comments/findCommentByCommentId", { commentId: id });
  }

}