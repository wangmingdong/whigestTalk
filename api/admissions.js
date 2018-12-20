import UI from "../utils/uiUtil";
import Net from "../utils/netUtil";
import Storage from "../utils/storageUtil";
import Config from "../config";

export default class AdmissionsSev {

  //提交招生信息
  static submitForm(data) {
    return Net.postCicadaJSON(Config.SERVER.url.kidscare+'/saas/recruitmentbrochure/saverecruitmentinfo', {}, data);
  }
  /**
   * 获取form 表单信息
   */
  static getFormInfo(data) {
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + '/saas/recruitmentbrochure/getrecruitmentinfo', {}, data)
  }
  static toSignUp(data) {
    return Net.postCicadaJSON(Config.SERVER.url.uc + '/followUp/addChild', data)
  }
  /**
   *  上传文件 
   */
  static uploadFile(params,data) {
    return Net.uploadFile(Config.SERVER.url.file + '/upload/savefile.shtml', params, data)
  }
};