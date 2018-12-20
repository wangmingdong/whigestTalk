import { request, setConfig, Promise } from '../lib/wx-promise-request';
import CompatibleUtil from "./compatibleUtil";
import Net from "./netUtil";
import Storage from "./storageUtil";
import UI from "./uiUtil";
/**
 * 本地文件管理 (<=10m)
 * 通过文件url作为key 
 * abjia
 */
export default class LocalFileUtil {

  /**
   * 存储网络文件到本地(长期有效)
   * 保存成功后 tempFile 将不可用
   * 
   */
  static saveNetFile(url) {
    return new Promise((resolver, reject) => {
      LocalFileUtil.saveTempFile(url)
          .then(res=>{
            let tempFile = res.tempFilePath;
              wx.saveFile({
                tempFilePath: tempFile,
                success: function (res) {
                    resolver(res.savedFilePath)
                },
                fail : function(err){
                  //容错微信file处理
                  if (err.errMsg.indexOf("file not exis")){
                    resolver("");
                  }
                  else{
                    UI.alert(err.errMsg);
                    reject(err);                   
                  }                  
                }
              })
          })
    });
  }

  /**
  * 保存到本地文件(临时)
  */
  static saveTempFile(url) {
    return Net.downloadFile({url : url});
  }


 /**
 * 删除本地文件
 */
  static removeFile(localPath) {
    return new Promise((resolver, reject) => {
      wx.removeSavedFile({
        filePath: localPath,
        success: resolver,
        fail: reject
      })
    });
  }

/**
 * 获取本地文件信息
 */
  static getFileInfo(localPath,digestAlgorithm) {    
    return new Promise((resolver, reject) => {
      wx.getFileInfo({
        filePath: localPath,
        digestAlgorithm: digestAlgorithm || 'md5',
        success: resolver,
        fail: reject
      })
    });
  }


  
  


  

  

  


  

  

}
