import { request, setConfig, Promise } from '../lib/wx-promise-request';

/**
 * 本地存储库
 * 数据存储的大小限制为 10MB
 * abjia
 */
export default class StorageUtil {

  static getStorageSync(key){
    return wx.getStorageSync(key);
  }

  static setStorageSync(key,value) {
    wx.setStorageSync(key, value);
  }

  static removeStorageSync(key) {
     wx.removeStorageSync(key);
  }

  static clearStorageSync() {
    wx.clearStorageSync();
  }

  static clearStorage() {
    wx.clearStorage();
  }


  static removeStorage(key) {
    return new Promise((resolver, reject) => {
      wx.removeStorage({
        key: key,
        success: resolver,
        fail: reject
      });
    });
  }

  static getStorage(key) {
    return new Promise((resolver,reject)=>{
      wx.getStorage({
        key : key,
        success: resolver,
        fail: reject
      });
    });
  }

  static setStorage(key, value) {
    return new Promise((resolver, reject) => {
      wx.setStorage({
        key: key,
        data: value,
        success: resolver,
        fail: reject
      });
    });
  
  }

}
