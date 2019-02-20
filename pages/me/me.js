// pages/me/me.js
import User from "./../../api/user";
import Auth from "./../../api/auth";
import CommentSev from "./../../api/comment";
import DiscussSev from "./../../api/discuss";
import StorageUtil from "./../../utils/storageUtil";
import FormatUtil from "./../../utils/formatUtil.js";
import NavigationUtil from "./../../utils/navigationUtil.js";
import Config from "./../../config";
import { $stopWuxRefresher, $wuxActionSheet, $wuxToast } from '../../lib/wux/index'

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    currentIndex: 0,
    tabItem: [{
      key: 0,
      value: 0,
      title: '说说',
      content: [1,2,3]
    }, {
      key: 1,
      value: 0,
      title: '相册',
      content: [4,5,6]
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let userInfo = StorageUtil.getStorageSync('userInfo')
    let globalUserInfo = app.globalData.userInfo
    this.setData({
      userInfo: globalUserInfo && globalUserInfo.id ? app.globalData.userInfo : userInfo
    })
  },

  // 切换评论和相册
  onChangeTabItem: function (e) {
    console.log('onChangeTabItem', e)
    const { key } = e.detail
    const index = this.data.tabItem.map((n) => n.key).indexOf(key)

    console.log(key, index)
    this.setData({
      currentIndex: key
    })
  },

  // 切换滑块
  onSwiperChange(e) {
    console.log('onSwiperChange', e)
    const { current: index, source } = e.detail
    const { key } = this.data.tabItem[index]

    console.log(key,index)
    if (!!source) {
      this.setData({
        currentIndex: key
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})