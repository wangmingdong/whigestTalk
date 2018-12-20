import CompatibleUtil from "./compatibleUtil";
import { request, setConfig, Promise } from '../lib/wx-promise-request';
import AuthSev from "../api/auth";
import Storage from "./storageUtil";

export default class BaseUtil {


  /**
   * 拨打手机号
   */
  static makePhoneCall(phoneNumber){
    return new Promise((resolver, reject) => {
      wx.getClipboardData({
        phoneNumber: phoneNumber,
        success: resolver,
        fail: reject
      });
    });
  }

  
  static loadWxUser() {
    return new Promise((resolver, reject) => {
     let wxUser = Storage.getStorageSync('wxUser');
     if (!wxUser){
       //获得用户信息
       AuthSev.getWxUserInfo()
         .then(res => {
           wxUser = res.userInfo;
           Storage.setStorageSync("wxUser", wxUser);
           resolver(wxUser);
         }, (err)=>{
           reject(err);
         }); 
     }
     else{
       resolver(wxUser);
     }
    
    
    });
  }

  /**
   * 打开设置界面
   */
  static openSetting() {
    if (!wx.openSetting) CompatibleUtil.upgradeModal();
    return new Promise((resolver, reject) => {
      wx.openSetting({      
        success: resolver,
        fail: reject
      });
    });
  }


  /**
   * 黑科技快速修改数组中的一项目
   * let keyStr = 'childList[' + index + '].animation';
   * let params = { isOpen: open};
   * params[keyStr] = this.animationCtrl.export();
   * this.setData(params);
   */
  static setArrayObject(_this,str,params,value){ 
    params = params || {};
    params[str] = value;
    _this.setData(params);   
  }

  /**
   * 计算百分比
   */
  static percentage(num,total,isNotTip){ 
    if (total == 0) return 0 + (isNotTip ? '' : "%");    
    return Math.round(num / total * 10000) / 100.00 + (isNotTip ? '' : "%")
  }
 

  /**
  * 获得用户剪切板内容
  */
  static getClipboardData() {
    if (!wx.getClipboardData) CompatibleUtil.upgradeModal();
    return new Promise((resolver, reject) => {
      wx.getClipboardData({     
        success: resolver,
        fail: reject
      });
    });
  }

/**
 * 写入剪切板
 */
  static setClipboardData(data) {
    if (!wx.setClipboardData) CompatibleUtil.upgradeModal(); 
    return new Promise((resolver, reject) => {
      wx.setClipboardData({
        data: data,
        success: resolver,
        fail: reject
      });
    });
  }

  // 获取手机信息
  // static getSystemInfo() {
  //   return new Promise((resolver, reject) => {
  //     wx.getSystemInfo({
  //       success: resolver,
  //       fail: resolver,
  //       complete: function (res) { },
  //     })
  //   })
  // }

  

  static startPullDownRefresh() {  
    return new Promise((resolver, reject) => {
      if (!wx.startPullDownRefresh) resolver({notMatch : true});
       wx.startPullDownRefresh({       
        success: resolver,
        fail: reject
      });
    });
  }


 


  static combine(pageObj,compObj){
    for (let compKey in compObj) {
      if (compKey == 'data') {
        // 合并页面中的data
        let data = compObj[compKey];
        for (let dataKey in data) {
          pageObj.data[dataKey] = data[dataKey];
        }
      } else {
        // 合并页面中的方法
        pageObj[compKey] = compObj[compKey];
      }
    }



  }


  static getParamByName(urlSearch,name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = urlSearch.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    {
      return null
    }
  }
  /**
    * 检测空对象
    * @param value
    * @returns {boolean}
    */
  static isEmptyObject(e) {
    var t;
    for (t in e)
      return !1;
    return !0
  }
}