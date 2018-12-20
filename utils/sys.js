import CompatibleUtil from "./compatibleUtil";
import { request, setConfig, Promise } from '../lib/wx-promise-request';
import Net from "./netUtil";
import Config from "../config";

export default class SysUtil {


  /**
   * 打点统计分析
   */
  static point(eventName) {
    
    let data = {
      cmoduleName : eventName,
      moduleName: 'microAttendance',
      operation : "click"
    }

    let currentSchool = getApp().globalData.currentSchool;
    if (currentSchool){
      data.schoolId = currentSchool.schoolId;
    }

    //如果么有schoolId 传递-1;
    data.schoolId = data.schoolId || '10000';
    
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + "/common/operation/createWxLog", {}, data);
  }

  /**
  * 系统登录打点
  */
  static createSystemLog() {
    let data = {
      moduleName: "",
      cmoduleName: "",
      operation: "LOGIN",  //------登录传值：LOGIN
      schoolId: '',
      source: 'wxApplet_zs',// 小程序体系 (wxApplet_wkq: 微考勤；wxApplet_zs：招生；wxApplet_xy：学院；wxApplet_message：知了加园；wxApplet_cr：知了讲堂)
      "organizationCode": ""
    }
    let currentSchool = getApp().globalData.currentSchool;
    if (currentSchool) {
      data.schoolId = currentSchool.schoolId;
    }
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + "/common/operation/createSystemLog", {}, data);
  }
  

} 
