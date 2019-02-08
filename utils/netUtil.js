import Navigation from "./navigationUtil";
import Storage from "./storageUtil";
import UI from "./uiUtil";
import { request,setConfig,Promise,} from '../lib/wx-promise-request';


setConfig({  
  concurrency: 10, // 限制最大并发数为 10
})

/**
 * 网络请求库
 * abjia
 */ 

export default class NetUtil {
 
  /**
   * 发送post json请求
   */
  static postJSON(url, params, data) {
    //获取本地token携带请求
    let token = wx.getStorageSync("wx_session_key");
    if (token) params.token = token;
    let openid = wx.getStorageSync("wxOpenId");
    if (openid) params.openid = openid;

    //获取本地session
    let session = wx.getStorageSync("wx_session");
    if (session) params.session = session;
    let hasFirstParams = url.indexOf("?") != -1;
    for (let key in params) {
      if (hasFirstParams) {
        url += `&${key}=${params[key]}`;
      }
      else {
        url += `?${key}=${params[key]}`;
        hasFirstParams = true;
      }
    }

    data = data || {}; 
    return new Promise((resolver, reject) => {  
      console.log("发起请求...",url);
      wx.request({
        url: url,
        method: 'POST',     
        dataType:"json", 
        header: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        data: data,
        success: (res) => {
          console.log("请求回来了...", res);;
          if (res.statusCode != 200) {
            wx.showToast({
              title: "服务端错误:" + res.statusCode + ', ' + res.data.message,
              icon: 'none',
              duration: 2000
            })
            reject({ 
              code: res.statusCode,
              msg: "服务端错误:" + res.statusCode + ', ' + res.data.message
            })
          }
          else {
            console.log("成功返回...", res);;
            resolver(res.data);
          }
        },
        fail: (error) => {
          reject(error);
        }
      }) 

    });   
  }

  /**
   * 发送post form请求
   */
  static postFORM(url, data) {
    let formData = "";
    if (data) {
      for (let key in data) {
        formData += key + "=" + data[key] + "&";
      }
      formData = formData.substring(0, formData.length - 1);
    }

    return request({
      url: url,
      method: 'POST',
      dataType: "json",
      header: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'        
      },
      data: data
    })
  }

  /**
   * 发送get请求
   */
  static getJSON(url, params) {
    params = params || {};
    let openid = wx.getStorageSync("wxOpenId");
    if (openid) params.openid = openid;

    let hasFirstParams = url.indexOf("?") != -1;
    
    for (let key in params) {
      if (hasFirstParams) {
         url += `&${key}=${params[key]}`;
      }
      else{
        url += `?${key}=${params[key]}`;
        hasFirstParams = true;
      }
    }
    return new Promise((resolver, reject) => {
      request({
        url: url,
        method: 'GET',
        dataType: "json",
        header: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (res.statusCode != 200) {
            reject({ msg: "服务端错误:" + res.statusCode })
            wx.showToast({
              title: "服务端错误:" + res.statusCode + ', ' + res.data.message,
              icon: 'none',
              duration: 2000
            })
          }
          else {
            resolver(res.data);
          }
        })
        .catch(error => {
          reject(error);
        });

    });   



   
  }


  /**
   * 发送知了封装请求
   */
  static postCicadaJSON(url,params,data){
    params = params || {};
    //获取本地token携带请求
    let token = wx.getStorageSync("cicada_token");      
    if (token) params.token = token;

    //获取本地session
    let session = wx.getStorageSync("wx_session");  
    if (session) params.session = session;
    
    //获得schoolId
    let currentSchool = getApp().globalData.currentSchool;
    if (currentSchool && params && !params.schoolId) params.schoolId = currentSchool.schoolId;

    let hasFirstParams = url.indexOf("?") != -1;
    for (let key in params) {
      if (hasFirstParams) {
        url += `&${key}=${params[key]}`;
      }
      else {
        url += `?${key}=${params[key]}`;
        hasFirstParams = true;
      }
    }

    // let postBody = {
    //   "style": "",
    //   "clientInfo": {
    //     "clientType": "web"
    //   },
    //   "data": data || {}
    // }

    let clientInfo = data || {}

  return new Promise((resolver, reject) => {
      NetUtil.postJSON(url, data)
        .then(res=>{                              
          //业务正常
          if (res.rtnCode == '0000000' || res.rtnCode == '7000004' || res.rtnCode == '7000005' || res.rtnCode == '1000212' || res.rtnCode == '0400013'){
            resolver(res);
          }                 
          //需要绑定账号
          else if (res.rtnCode == '7000019') {         
            reject("bindUser")            
          }   
           
          //加密session出现的问题
          else if (res.rtnCode == '7000003') {
            Storage.removeStorageSync('wx_session');  
            UI.alert(res.msg, 'error');     
            reject(res);                
          }
          //服务端需要设置新的msg 需要让前端修改
          else if (res.rtnCode == '0100009') {         
            UI.alert("请先联系园长，电脑端登录知了平台，在职工管理中添加您的手机号码", 'error');   
            reject(res);       
          }                                    
          else{
            console.log('业务err',res);  
            UI.alert(res.msg, 'error');
            reject(res);
          }        
        },(err)=>{   
          let msg = err.msg || '网络错误';
          console.log('网络err', msg);     
          UI.alert(msg, 'error');         
          reject(err);
        })          
    });
    
  }


  /**
   * 获得网络状态
   */
  static getNetworkType() {
    return new Promise((resolver, reject) => {
      wx.getNetworkType({
        success: resolver,
        fail: reject
      });
    });
  }


  /**
   * 下载文件
   */
  static downloadFile(params) {
    params = params|| {};
    return new Promise((resolver, reject) => {
      wx.downloadFile(Object.assign({}, params, {
        success: resolver,
        fail: reject
      }))
    });
  }

  static uploadFile(url,params,data){
    params = params || {};
    return new Promise((resolve, reject) => {

      wx.uploadFile(Object.assign({}, {
        url: url,//仅为示例，非真实的接口地址
        filePath: params,
        name: 'file',
        formData: data || {}
      }, {
        success: resolve,
        fail: reject
      }))
    })
  }

  

}
