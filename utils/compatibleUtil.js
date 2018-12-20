import { request, setConfig, Promise } from '../lib/wx-promise-request';
export default class CompatibleUtil{
  /**
  * 兼容性弹窗
  */
  static upgradeModal() {
    wx.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
  }

  /**
   * https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-caniuse.html
   */
  static canIUse(str){
    return wx.canIUse(str)
  }


  static minVersion(targetVersion){
      let systemInfo = getApp().globalData.systemInfo;   
      if (systemInfo.SDKVersion >= targetVersion){
        return true;
      }
      else{
        return false;
      }
  }

  

}