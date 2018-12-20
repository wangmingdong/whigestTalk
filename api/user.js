import UI from "../utils/uiUtil";
import Net from "../utils/netUtil";
import Config from "../config";
const app = getApp()

export default class UserSev {


  /**
  * 设置用户配置
  */
  static setUserSettings(data) {
    return Net.postCicadaJSON(Config.SERVER.url.uc + "/user/setUserSetting", {}, data);
  }

  /**
* 设置用户配置
*/
  static getUserSettings(data) {
    return Net.postCicadaJSON(Config.SERVER.url.uc + "/user/getUserSettings", {}, data);
  }

  /**
* 修改用户名称
*/
  static updateUserName(data) {
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + "/saas/employee/updateUserName", {}, data);
  }

  // 查对应用户名次及前一名与后一名
  static querySelfPlace(param, data) {
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/wxQuestion/query/querySelfPalce", param, data);
    // return Net.postCicadaJSON("http://172.31.120.64:8080/qrcode/wxQuestion/query/querySelfPalce", param, data);
  }

  // 未授权用户，拉取前三名的排名
  static getTopTree(param, data) {
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/wxQuestion/query/topThree", param, data);
  }

  // 查询用户是否存在
  static queryUserInfo(param, data) {
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/wxQuestion/query/queryUserInfo", param, data);
  }

  // 新增一个题库用户
  static addUserInfo(data) {
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/wxQuestion/query/addUserInfo", {}, data);
  }

  /**
  * 新增用户
  */
  static addUserData(data) {
    return Net.postJSON(Config.SERVER.url.root + "/users/addUser", {}, data);
  }

  /**
  * 根据openid查用户
  */
  static findUserByOpenId(openid) {
    return Net.getJSON(Config.SERVER.url.root + "/users/findUserByOpenId", {openid: openid});
  }
  




}