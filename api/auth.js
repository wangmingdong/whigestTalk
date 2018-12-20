import { request, setConfig, Promise } from '../lib/wx-promise-request';
import UI from "../utils/uiUtil";
import Net from "../utils/netUtil";
import Storage from "../utils/storageUtil";
import  Config from "../config";
import Navigation from '../utils/navigationUtil.js';


export default class AuthSev {
  

/**
 * 登录系统
 */
static loginSys(){
  return new Promise((resolver, reject) => {
      let session = Storage.getStorageSync("wx_session");
      let wx_session_key = Storage.getStorageSync("wx_session_key");
      let wxUnionId = Storage.getStorageSync("wxUnionId");
      let openid = Storage.getStorageSync("openid");
      AuthSev.checkSession()
        .then(isWxLogin=>{     
          console.log("开始登录..");
          console.log('isWxLogin', isWxLogin);
          //已登录
          if (isWxLogin && session && wxUnionId && wx_session_key && openid){          
            console.log("已经登录.......");
            resolver({ 
              session: session, 
              wxUnionId: wxUnionId,
              wxSessionKey: wx_session_key,
              openid: openid
              });
          }
          //未登录,开始登录
          else{
            console.log("未登录..");
            //清除wxUser
            Storage.removeStorageSync("wxUser");
            AuthSev.wxLogin()
              //获得authCode
              .then((res) => {
                console.log("获得的authcode", res.code);
                return AuthSev.getOpenId(res.code);
              }, err => {
                console.log(err)
              })
              //获得session
              .then((res) => {    
                console.log('session-->', res);
                if (res.data.session) Storage.setStorageSync("wx_session", res.data.session);
                if (res.data.session_key) Storage.setStorageSync("wx_session_key", res.data.session_key);
                if (res.data.wxUnionId) Storage.setStorageSync("wxUnionId", res.data.wxUnionId);
                if (res.data.openid) Storage.setStorageSync("wxOpenId", res.data.openid);
                resolver(res.data);               
              })                     
          }
        })
  });
}

  static checkUserAddSchool(params) {
    params.appCode = 'zs';
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/auth/wx/applet/checkUserAddSchool", params, {});
}



  /**
   * 获得微信用户信息
   * 需要权限
   */
  static getWxUserInfo(params){  
    return new Promise((resolver, reject) => {
      wx.getUserInfo(Object.assign({}, params, {
        success: resolver,
        fail: reject
      }))
    });
  }

  
  static getSchoolList(data){
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + "/user/querySchoolListByUser", {}, data);
  }


  /**
   * 获得访客事由
   */
  static getPurposes(data) {
    return Net.getJSON(Config.SERVER.url.uc + "/visitor/purposes", {}, data);
  }

  /**
   * 获得微信的openId
   */
  static getOpenId(code) {
    return Net.getJSON(Config.SERVER.url.root + "/auth/login", {code: code});
  }

  /**
   * 反解密用户信息
   */
  static getDecipheringInfo(id, data) {
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/wxQuestion/query/encryption", id ? { id: id} : {}, data);
  }


  
  /**
   * 检测用户是否绑定微信公众号
   */
  static checkUserBindWx() {
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/auth/wx/applet/checkUserBindWx", {}, {});
  }

  static findSchoolById(data) {
    return Net.postCicadaJSON(Config.SERVER.url.uc + "/school/findSchoolById", {}, data);
  }

  
  static getCustom(data){
    return Net.postCicadaJSON(Config.SERVER.url.boss + "/application/apply", {}, data);
  }



  /**
   * 绑定用户手机
   * data:session,phoneNum
   */
  static bindWxUser(data) {
    data.appCode = 'zs';
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/auth/wx/applet/bindWxUser",{}, data);
  }


  /**
   * 获得知了用户信息
   */
  static getCicadaUserInfo(data,zsParams) {
    return new Promise((resolver,reject)=>{      
      Net.postCicadaJSON(Config.SERVER.url.qrcode + "/auth/wx/applet/getUserInfo", {}, { session: data.session, appCode:'zs' })
        .then((res) => {  
          if (res.rtnCode == '7000004'){
            Storage.removeStorageSync('cicada_token');
            Storage.removeStorageSync('userInfo');
            // 没有绑定，用unionId  检测有没有其他小程序绑定过！ 
            return AuthSev.bindWxUserByUnionId({ session: data.session, appCode: 'zs', wxUnionId: data.wxUnionId})
            .then(res => {
              // 检测有别的小程序已经绑定了
              if (res.bizData.token){
                Storage.setStorageSync("cicada_token", res.bizData.token);
                resolver(res.bizData);
              }
              // 检测到没有绑定小程序
              else{
                console.log('zsParams-->', zsParams)
                //  sId存在并且是fxzs  说明是fxzs 进来的 就是没有编辑权限 只能开园
                if (zsParams.zsType && zsParams.zsType == 'fxzs'){
                  console.log('fxzs--->');
                  AuthSev.getSchoolInfo({ schoolId: zsParams.sId})
                  .then(res => {
                    getApp().globalData.currentSchool = res.bizData;
                    getApp().globalData.isEditorZS = false;
                    getApp().globalData.isOpenGarden = true;
                    // 这是一个家长用户
                    getApp().globalData.hasGarden = false;
                    getApp().globalData.userId = zsParams.userId;
                    Navigation.redirectTo('/pages/me/admissions/showAdmissions');
                  })
                  
                }
                else if (zsParams.zsType && zsParams.zsType == 'yqzs'){
                  console.log('yqzs--->');
                  // Navigation.redirectTo(`/pages/me/bindUserA/bindUserSmsCode`, { sId: zsParams.sId })
                  AuthSev.generaterTestAB({ sId: zsParams.sId });
                }
                else{
                  //Navigation.redirectTo(`/pages/me/bindUserA/bindUserSmsCode`);
                  AuthSev.generaterTestAB({});
                }
           
              } 
              
            },err => {
              reject(err);
            })
          }
          // 这块说明已经绑定过了 
          else{
            //存入token本地
            if (res.bizData.token){
              Storage.setStorageSync("cicada_token", res.bizData.token);
            }
            //  这块代码不明白什么意思 ！！ 不敢动
            if (!res.bizData.hasBindUnionId) {
              console.log("老用户需要绑定uid");
              //重新登录
              AuthSev.wxLogin()
                .then(tt => {
                  return AuthSev.getOpenId(tt.code);
                })
                .then(() => {
                  resolver(res.bizData);
                }, err => {
                  reject(err)
                });
            }
            else {
              resolver(res.bizData);
            } 
          }             
        },(err)=>{
          reject(err)
        })
    });

     
  }
  /**
   *  用于 生成 A B 面的方法
   */
  static generaterTestAB(data){
    let history_page = Storage.getStorageSync('test_page');
    console.log('history_page-->', history_page);
    if (history_page === 1) {
      Navigation.redirectTo(`/pages/me/bindUserA/bindUserSmsCode`,data)
      return;
    }
    if (history_page === 0) {
      Navigation.redirectTo(`/pages/me/bindUserB/bindUserSmsCode`,data)
      return;
    }
    let random = parseInt(Math.random() * 10) % 2;
    console.log('random-->', random);
    random ? Navigation.redirectTo(`/pages/me/bindUserA/bindUserSmsCode`,data) :
      Navigation.redirectTo(`/pages/me/bindUserB/bindUserSmsCode`,data);
    Storage.setStorageSync("test_page", random); 
  }
  /**
   * 登录微信
   */
  static wxLogin() {
    return new Promise((resolver, reject) => {
      wx.login({
        success: resolver,
        fail: reject
      });
    });
  }


  /**
  * 检测微信登录状态
  */
  static checkSession() {
    return new Promise((resolver, reject) => {
      wx.checkSession({
        success: () => { resolver(true)},
        fail: () => { resolver(false)}
      });
    });
  }

  /**
  * 获得验证码
  */
  static getSMSCode(phoneNum, business) {
    var data = {
      "app": "yxb",
      "num": 0,
      "business": business || '2000',
      "phone": phoneNum
    }
    return Net.postCicadaJSON(Config.SERVER.url.uc + "/api/user/getSMSCode", {}, data);
  }

  /**
   * 校验验证码
   */
  static validateSmsCode(data) {
    var data = {
      "app": "yxb",
      "smsCode": data.smsCode,
      "business": "2000",
      "phone": data.phoneNum
    }
    return Net.postCicadaJSON(Config.SERVER.url.uc + "/user/validateSmsCode", {}, data);
  }
  /** 用unionId  检测有没有其他小程序绑定过！
   *  
   */
  static bindWxUserByUnionId(data){
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + '/auth/wx/applet/bindWxUserByUnionId',{},data)
  }

  /**
   *  通过手机号 查找用户是否在saas 系统中
   */

  static getUserInfoByPhone(data){
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + '/auth/wx/applet/getUserInfoByPhone',{},data)
  }
  /**
   * 根据schoolId 获取学校信息
   */
  static getSchoolInfo(data){
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + '/auth/wx/applet/getSchoolInfo',data,{})
  }
    

}