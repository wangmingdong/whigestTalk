import UI from "../utils/uiUtil";
import Net from "../utils/netUtil";
import Config from "../config";
const app = getApp()

export default class CommentSev {


  /**
  * 查询评论列表
  */
  static getCommentList(data) {
    return Net.postJSON(Config.SERVER.url.root + "/comments/queryComments", {}, data);
  }

  /**
  * 新增一条评论
  */
  static addComment(data) {
    return Net.postJSON(Config.SERVER.url.root + "/comments/addComment", {}, data);
  }

  // 点赞
  static giveGood(data) {
    return Net.postJSON(Config.SERVER.url.root + "/comments/giveGood", {}, data);
  }

  /**
   * 根据commentId查询详情
   */
  static findCommentByCommentId(id) {
    return Net.getJSON(Config.SERVER.url.root + "/comments/findCommentByCommentId", { commentId: id });
  }

  /**
   * 根据commentId查询点赞人列表
   */
  static findGoodListByCommentId(id) {
    return Net.getJSON(Config.SERVER.url.root + "/comments/findGoodListByCommentId", { commentId: id });
  }

  /**
  * 删除一条说说
  */
  static deleteComment(id) {
    return Net.getJSON(Config.SERVER.url.root + "/comments/deleteComment", { commentId: id });
  }

  /**
  * 查询图片列表
  */
  static queryTargetImages(data) {
    return Net.postJSON(Config.SERVER.url.root + "/comments/queryTargetImages", {}, data);
  }

}