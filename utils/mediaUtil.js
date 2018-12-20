import { request, setConfig, Promise } from '../lib/wx-promise-request';
import CompatibleUtil from "./compatibleUtil";
import UI from "./uiUtil";


/**
 * 多媒体工具类
 * abjia
 */
export default class MediaUtil {

  /**
   * 背景播放器
   */
  static play(url,context) {        
    context.src = url;
    context.play();      
  }

  static pause(){
    context.pause();   
  }



  static vibrateLong(){
    return new Promise((resolver, reject) => {
      wx.vibrateLong({       
        success: resolver,
        fail: reject
      });
    });
  }
  


}
