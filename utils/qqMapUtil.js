import CompatibleUtil from "./compatibleUtil";
import { request, setConfig, Promise } from '../lib/wx-promise-request';
import QQMapWX   from '../lib/qqmap-wx-jssdk.min.js';
import AuthSev from "../api/auth";
import Config  from "../config";
import UI from "./uiUtil.js";

export default class QQMapUtil {
  constructor(){
    this.initSDK();
  }

  initSDK(){
    console.log("初始化qqMap");
    this.qqmapsdk = new QQMapWX({
      key: Config.QQ_MAP_KEY
    });
  }


  /**
   * 地址检索
   */
  searchAddress(params) {    
    return new Promise((resolver, reject) => {
      this.qqmapsdk.getSuggestion(Object.assign({}, params, {
        success: resolver,
        fail: reject
      }))
    });
  }

  /**
   * 地址poi检索
   */
  searchPoi(params) {
    return new Promise((resolver, reject) => {
      this.qqmapsdk.search(Object.assign({}, params, {
        success: resolver,
        fail: reject
      }))
    });
  }
  
  
  /**
   * 逆地理位置解析
   */
  reverseGeocoder(params){
    return new Promise((resolver, reject) => { 
      this.qqmapsdk.reverseGeocoder(Object.assign({}, params, {
        success: resolver,
        fail: reject
      }))      
    });
  }


  /**
   * 地理位置解析
   */
  geocoder(params) {
    return new Promise((resolver, reject) => {
      this.qqmapsdk.geocoder(Object.assign({}, params, {
        success: resolver,
        fail: reject
      }))
    });
  }





  /**
   * 获得城市列表
   */
  getCityList(){
    return new Promise((resolve, reject) => {
      this.qqmapsdk.getCityList(Object.assign({}, {}, {
        success: (res)=>{
          if (res.status != 0){
            UI.alert(res.message);
            reject(res.message);
          }
          else{
            resolve(res.result);
          }
        },
        fail: reject
      }))
    });
  }

  /**
   * 获得省市区县
   */
  getDistrictByCityId(cityId) {
    return new Promise((resolver, reject) => {
      this.qqmapsdk.getCityList(Object.assign({}, {cityId: cityId}, {
        success: resolver,
        fail: reject
      }))
    });
  }

}

var qqMapUtil = new QQMapUtil();
module.exports = qqMapUtil;