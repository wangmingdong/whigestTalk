import CompatibleUtil from "./compatibleUtil";
import { request, setConfig, Promise } from '../lib/wx-promise-request';


export default class LocationUtil {


  /**
   * 获得当前位置信息
   */
  static getLocation(locationType){
    locationType = locationType || 'wgs84';
    return new Promise((resolver, reject) => {
      wx.getLocation({
        type: locationType,
        success: resolver,
        fail: (e)=>{
          reject("locationError",e)
        }
      });
    });
  }


  static shake(acceleration){

       


  }


  /**
   * 打开地图选择位置。
   */
  static chooseLocation() {
    return new Promise((resolver, reject) => {
      wx.getLocation({
        success: (data)=>{
          resolver('success',data);
        },
        cancel : (data)=>{
          resolver('cancel',data);
        },
        fail: reject
      });
    });
  }


  /**
   * 微信内置地图查看位置
   */
  static openLocation(params) {
    return new Promise((resolver, reject) => {  
      wx.openLocation(Object.assign({}, params, {
        success: resolver,
        fail: reject
      }))
    });
  }


  /**
   *  
   */
  static getGreatCircleDistance(lat1, lng1, lat2, lng2) {
    const EARTH_RADIUS = 6378.137;// 地球半径
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * EARTH_RADIUS;// EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000;
    return s;   
  }
  

}