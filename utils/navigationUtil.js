import { request, setConfig, Promise } from '../lib/wx-promise-request';
import CompatibleUtil from "./compatibleUtil";
import UI from "./uiUtil";


/**
 * 导航工具类
 * abjia
 * 页面路径只能是五层
 */
export default class NavigationUtil{

  /**
   * 保留当前页面，跳转到应用内的某个页面
   */
  static navigateTo(url, params) {
    if (params) {
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
    }

    return new Promise((resolver, reject) => {
      wx.navigateTo({
        url: url,
        success: resolver,
        fail: reject
      });
    });
  }


  /**
  * 关闭当前页面，跳转到应用内的某个页面。
  */
  static redirectTo(url, params) {
    if (params) {
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
    }

    return new Promise((resolver, reject) => {
      wx.redirectTo({
        url: url,
        success: resolver,
        fail: (err)=>{
          UI.alert("跳转失败!");
          reject(err);
        }
      });
    });
  }


  /**
  * 关闭所有页面，打开到应用内的某个页面。
  */
  static reLaunch(url) {
    return new Promise((resolver, reject) => {
      wx.reLaunch({
        url: url,
        success: resolver,
        fail: reject
      });
    });
  }


/**
 * 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
 */
  static switchTab(url) {
    return new Promise((resolver, reject) => {
      wx.switchTab({
        url: url,
        success: resolver,
        fail: reject
      });
    });
  }


  /**
   * 关闭当前页面，返回上一页面或多级页面。可通过 getCurrentPages()) 获取当前的页面栈，
   * 决定需要返回几层。
   */
  static navigateBack(url, delta) {
    wx.navigateBack({ url: url, delta: delta});
  }


  /**
   * 动态设置当前页面的标题。
   */
  static setNavigationBarTitle(title) {
    return new Promise((resolver, reject) => {
      wx.setNavigationBarTitle({
        title: title,
        success: resolver,
        fail: reject
      });
    });
  }


  /**
  * 动态设置当前页面的标题。
  */
  static setNavigationBarTitle(title) {
    return new Promise((resolver, reject) => {
      wx.setNavigationBarTitle({
        title: title,
        success: resolver,
        fail: reject
      });
    });
  }

  /**
  * 在当前页面显示/隐藏导航条加载动画。
  */
  static toggleNavigationBarLoading(isShow){
    if (isShow)
        wx.showNavigationBarLoading();
    else
      wx.hideNavigationBarLoading();
  }


  /**
   * 设置导航条样式
   */
  static setNavigationBarColor(params){
    if (!wx.setNavigationBarColor) CompatibleUtil.upgradeModal();  
    return new Promise((resolver, reject) => {
      wx.setNavigationBarColor(Object.assign({}, params, {
        success: resolver,
        fail: reject
      }))
    }); 
  }

  

}
