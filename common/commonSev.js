export default class  CommonSev {

  static getWxShare(title,url,imageUrl){
    let wxUserInfo = getApp().globalData.wxUserInfo || {};  
    let name = wxUserInfo.nickName ? wxUserInfo.nickName : "";
    // let title = `${name} 邀请你使用：微信打卡，简而不“烦”`;    
    //let title = `知了智能名片`;       
     return {
       title: title ? title :'身为幼教的你，还没上过名园荟的擂台？！',
       path: url?url:'/pages/main/main',
       imageUrl: imageUrl ? imageUrl :"https://static.imzhiliao.com/%E9%87%91%E5%AE%9D%E5%88%86%E4%BA%AB%E5%9B%BE.png" 
     }
   }

}