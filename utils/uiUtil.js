import { request, setConfig, Promise } from '../lib/wx-promise-request';
import CompatibleUtil from "./compatibleUtil";
/**
 * 界面UI库
 * abjia
 */
export default class UIUtil {

  /**
   * toast提示
   */
  static toast(title,type) {
    var params = {
      title : title,
      icon: ''
    }
    params.duration = params.duration || 2000;
    wx.showToast(params)
  }

  /**
   * 询问窗口
   */
  static confirm(content,title){
    title = title || '提示';
    if(title && title == 'error')
        title = '系统提示';
    
    return new Promise((resolver, reject) => {
        wx.showModal({
          title: title,
          content: content,
          success: resolver,
          fail : reject
    });
  });
}

  /**
   * alert窗口
   */
  static alert(content, title) {
    title = title || '提示'
    if (title && title == 'error')
      title = '系统提示';

    return new Promise((resolver, reject) => {
      wx.showModal({
        title: title,
        content: content,
        showCancel : false,
        success: resolver,
        fail: reject
      });
    });
  }


  /**
   * 弹窗模态窗口
   */
  static showCustomModal(){
    
  }


  /**
   *  actionsheet菜单
   * */  
  static actionSheet(params) {
    params = params || {};
    return new Promise((resolver, reject) => {
      wx.showActionSheet(Object.assign({}, params, {
        success: resolver,
        fail: reject
      }))
    });
  }


  /**
   * loading
   * 基础库>1.0.0
   */
  static loading(isShow,params) {
    params = params || {}
    //兼容处理
    if (!wx.showLoading || !wx.hideLoading) CompatibleUtil.upgradeModal();

    if (isShow) {     
      return new Promise((resolver, reject) => {
        params.title = params.title || "加载中...";
        params.mask = params.mask || true;
        wx.showLoading(Object.assign({}, params, {
          success: resolver,
          fail: reject
        }))
      });

     
    }
    else{
      wx.hideLoading();
      
    }
    
  } 

  /**
   * 导航loading 无阻塞
   */
  static navLoading (isShow){
    if (isShow) wx.showNavigationBarLoading()
    else wx.hideNavigationBarLoading()
  }


  
  /**
   * 预览图片
   */
  static previewImage(params) {
    params = params || {};
    return new Promise((resolver, reject) => {
      wx.previewImage(Object.assign({}, params, {
        success: resolver,
        fail: reject
      }))
    });
  }

  /**
   * 保存图片相册
   */
  static saveImageToPhotosAlbum(params) {
    params = params || {};
    //兼容处理
    if (!wx.saveImageToPhotosAlbum) CompatibleUtil.upgradeModal();    
    return new Promise((resolver, reject) => {
      wx.saveImageToPhotosAlbum(Object.assign({}, params, {
        success: resolver,
        fail: reject
      }))
    });
  }

}
