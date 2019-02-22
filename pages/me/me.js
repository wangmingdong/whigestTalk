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
    pageSize: 10,
    pageNum: 1,
    height: 0,
    isNoMore: false,  // 不在加载了
    rankPageNum: [],
    myCommentList: [],
    myImageList: [],
    imgIsNoMore: false,
    imgPageNum: [],
    scrollTop: 0,
    tabItem: [{
      key: 0,
      value: 0,
      title: '说说',
      spinning: false,
      list: [],
      isNoMore: false,
      pageNum: 1,
      pageSize: 10,
      rankPageNum: [],
    }, {
      key: 1,
      value: 0,
      title: '相册',
      spinning: false,
      list: [],
      isNoMore: false,
      pageNum: 1,
      pageSize: 10,
      rankPageNum: [],
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    StorageUtil.setStorageSync("myCommentList", []);
    let userInfo = StorageUtil.getStorageSync('userInfo')
    let currentTabItem = this.data.tabItem[this.data.currentIndex]
    let self = this
    this.data.tabItem[this.data.currentIndex].spinning = true
    this.setData({
      tabItem: this.data.tabItem
    })
    Auth.loginSys().then(res => {
      if (res) {
        StorageUtil.setStorageSync("sessionKey", res.session_key);
        StorageUtil.setStorageSync("openid", res.openid);
        self.findUserByOpenId(res, () => {
          app.globalData.userInfo = userInfo

          self.data.tabItem[self.data.currentIndex].spinning = false
          self.setData({
            userInfo: userInfo,
            hasUserInfo: userInfo,
            tabItem: this.data.tabItem
          })
          console.log(userInfo)
          // 查询评论数据
          self.getCommentList()
        })
      }
    })

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
    this.data.tabItem[0].list = StorageUtil.getStorageSync('myCommentList')
    if (this.data.tabItem[0].list.length) {
      this.setData({
        tabItem: this.data.tabItem
      })
    }
  },

  // 查询用户信息
  findUserByOpenId: function (res, fn) {
    User.findUserByOpenId(res.openid).then(info => {
      if (info.data) {
        app.globalData.userInfo = info.data
        this.setData({
          userInfo: info.data,
          hasUserInfo: info.data
        })
        StorageUtil.setStorageSync("userInfo", info.data);
        if (fn) {
          fn(info.data)
        }
      } else {
        if (fn) {
          fn(res)
        }
      }
    })
  },

  //事件处理函数
  showCommentDetail: function (e) {
    let commentInfo = e.currentTarget.dataset.commentInfo
    StorageUtil.setStorageSync("commentInfo", commentInfo);
    app.globalData.share = false;
    NavigationUtil.navigateTo('../commentDetail/commentDetail', { id: commentInfo.id })
    // wx.navigateTo({
    //   url: '../logs/logs'
    // })
  },

  // 格式化数据
  formatCommentList: function (commentList) {
    commentList.forEach((v, i) => {
      // 处理时间
      if (v.createTime) {
        // v.fmtCreateTime = FormatUtil.isToday(v.createTime)
        v.fmtCreateTime = FormatUtil.getFullDate(v.createTime, '.')
      }
      if (v.source) {
        v.source = v.source.split('<')[0].replace(/(^\s*)|(\s*$)/g, "")
      }
    })
    return commentList;
  },

  // 加载更多评论列表
  loadRankMore: function () {
    let currentTabItem = this.data.tabItem[this.data.currentIndex]
    if (!currentTabItem.spinning && !currentTabItem.isNoMore) {
      this.data.tabItem[this.data.currentIndex].pageNum++
      this.setData({
        tabItem: this.data.tabItem
      })
      if (this.data.currentIndex) {
        this.getImageList()
      } else {
        this.getCommentList()
      }
    }
  },

  // 查询评论列表
  getCommentList: function () {
    let currentTabItem = this.data.tabItem[this.data.currentIndex]
    let param = {
      pageNum: currentTabItem.pageNum,
      pageSize: currentTabItem.pageSize,
      targetId: this.data.userInfo.openid
    }
    currentTabItem.rankPageNum.push(this.data.tabItem[this.data.currentIndex].pageNum)
    this.data.tabItem[this.data.currentIndex].spinning = true
    this.data.tabItem[this.data.currentIndex].loadMoreText = '请稍后...'
    this.data.tabItem[this.data.currentIndex].imgPageNum = this.data.imgPageNum
    this.setData({
      tabItem: this.data.tabItem
    })
    CommentSev.getCommentList(param).then(res => {
      // $stopWuxRefresher()
      if (res && res.data && res.data.rows && res.data.rows.length) {
        if (res.data.rows.length) {
          let resultData = res.data.rows
          let loadMoreText = '加载更多'
          // 处理数据
          resultData = this.formatCommentList(resultData)
          // 如果返回的个数小于pageSize
          if (resultData.length < currentTabItem.pageSize) {
            loadMoreText = '我是有底线的'
            this.data.tabItem[this.data.currentIndex].loadMoreText = loadMoreText
            this.data.tabItem[this.data.currentIndex].isNoMore = true
          }
          this.data.tabItem[this.data.currentIndex].list = currentTabItem.list.concat(resultData)
          this.data.tabItem[this.data.currentIndex].spinning = false
          this.data.tabItem[this.data.currentIndex].loadMoreText = loadMoreText
          this.setData({
            tabItem: this.data.tabItem
          })
        } else {
          this.data.tabItem[this.data.currentIndex].isNoMore = true
          this.data.tabItem[this.data.currentIndex].spinning = false
          this.data.tabItem[this.data.currentIndex].loadMoreText = '我是有底线的'
          this.setData({
            tabItem: this.data.tabItem
          })
        }
      } else {
        this.data.tabItem[this.data.currentIndex].isNoMore = true
        this.data.tabItem[this.data.currentIndex].spinning = false
        this.data.tabItem[this.data.currentIndex].loadMoreText = '我是有底线的'
        this.setData({
          tabItem: this.data.tabItem
        })
      }
      StorageUtil.setStorageSync("myCommentList", this.data.tabItem[this.data.currentIndex].list);
    })
  },

  // 查询图片列表
  getImageList: function () {
    let currentTabItem = this.data.tabItem[this.data.currentIndex]
    let param = {
      pageNum: currentTabItem.pageNum,
      pageSize: currentTabItem.pageSize,
      targetId: this.data.userInfo.openid
    }
    currentTabItem.rankPageNum.push(this.data.tabItem[this.data.currentIndex].pageNum)
    this.data.tabItem[this.data.currentIndex].spinning = true
    this.data.tabItem[this.data.currentIndex].loadMoreText = '请稍后...'
    this.data.tabItem[this.data.currentIndex].imgPageNum = this.data.imgPageNum
    this.setData({
      tabItem: this.data.tabItem
    })
    CommentSev.queryTargetImages(param).then(res => {
      // $stopWuxRefresher()
      if (res && res.data && res.data.rows && res.data.rows.length) {
        if (res.data.rows.length) {
          let resultData = res.data.rows
          let loadMoreText = '加载更多'
          // 如果返回的个数小于pageSize
          if (resultData.length < currentTabItem.pageSize) {
            loadMoreText = '我是有底线的'
            this.data.tabItem[this.data.currentIndex].loadMoreText = loadMoreText
            this.data.tabItem[this.data.currentIndex].isNoMore = true
          }
          this.data.tabItem[this.data.currentIndex].list = currentTabItem.list.concat(resultData)
          this.data.tabItem[this.data.currentIndex].spinning = false
          this.data.tabItem[this.data.currentIndex].loadMoreText = loadMoreText
          this.setData({
            tabItem: this.data.tabItem
          })
        } else {
          this.data.tabItem[this.data.currentIndex].isNoMore = true
          this.data.tabItem[this.data.currentIndex].spinning = false
          this.data.tabItem[this.data.currentIndex].loadMoreText = '我是有底线的'
          this.setData({
            tabItem: this.data.tabItem
          })
        }
      } else {
        this.data.tabItem[this.data.currentIndex].isNoMore = true
        this.data.tabItem[this.data.currentIndex].spinning = false
        this.data.tabItem[this.data.currentIndex].loadMoreText = '我是有底线的'
        this.setData({
          tabItem: this.data.tabItem
        })
      }
      StorageUtil.setStorageSync("myImageList", this.data.tabItem[this.data.currentIndex].list);
    })
  },

  // 预览列表图片
  previewImgs: function (e) {
    let currentTabItem = this.data.tabItem[this.data.currentIndex]
    let imgUrl = e.currentTarget.dataset.imgUrl
    let imgList = e.currentTarget.dataset.imgList
    let urls = []
    currentTabItem.list.forEach((v, i) => {
      urls.push(v.img)
    })
    wx.previewImage({
      current: imgUrl,
      urls: urls
    })
  },

  // 弹出/收回说说功能按钮
  showCommentOptions: function (e) {
    let commentInfo = e.target.dataset.commentInfo
    let self = this
    $wuxActionSheet().showSheet({
      titleText: '操作',
      buttons: [],
      buttonClicked(index, item) {
        return true
      },
      cancelText: '取消',
      cancel() { },
      destructiveText: '删除',
      destructiveButtonClicked() {
        wx.showLoading({
          title: '请求中...',
          mask: true
        })
        CommentSev.deleteComment(commentInfo.id).then(res => {
          if (res && res.data) {
            wx.hideLoading()
            self.updateCommentData('delete', commentInfo)
            $wuxToast().show({
              type: 'success',
              duration: 1500,
              color: '#fff',
              text: '删除成功！'
            })
          }
          this.cancel()
        })
      },
    })
  },

  // 点赞请求
  giveGoodAction: function (e) {
    let param = {
      openid: this.data.userInfo.openid,
      commentId: e.target.dataset.commentId
    }
    let self = this
    console.log(param)
    CommentSev.giveGood(param).then(res => {
      console.log(res)
      if (res && Object.keys(res).indexOf('data') > -1) {
        this.data.tabItem[this.data.currentIndex].list.forEach((v, i) => {
          if (v.id == param.commentId) {
            // 如果没赞则+1
            if (res.data) {
              v.goodNum++
              v.usedGood = true
            } else {
              // 如果已经赞了则-1
              v.goodNum--
              v.usedGood = false
            }
            self.updateCommentData('update', v)
          }
        })
        this.setData({
          tabItem: this.data.tabItem
        })
      }
    })
  },

  // 点赞授权
  giveGoodForPermisson: function (e) {
    this.getUserInfo(e, res => {
      // 授权成功执行后续操作
      if (res) {
        this.giveGoodAction(e)
      }
    })
  },

  // 更新或者删除说说
  updateCommentForEach: function (type, oldList, commentObj) {
    let newList = []
    if (oldList.length) {
      if (type == 'update') {
        newList = oldList.map((v, i) => {
          if (v.id == commentObj.id) {
            return v = commentObj
          } else {
            return v
          }
        })
      } else if (type == 'delete') {
        for (let i = 0; i < oldList.length; i++) {
          if (oldList[i].id == commentObj.id) {
            oldList.splice(i, 1)
            i--
            break
          }
        }
        newList = oldList
      }
    }
    return newList
  },

  //  更新缓存中说说状态
  updateCommentData: function (type = 'update', comment) {
    let myCommentList = StorageUtil.getStorageSync('myCommentList')
    let commentList = StorageUtil.getStorageSync('commentList')
    let newMyCommentList = this.updateCommentForEach(type, myCommentList, comment)
    let newCommentList = this.updateCommentForEach(type, commentList, comment)
    StorageUtil.setStorageSync('commentList', newCommentList)
    StorageUtil.setStorageSync('myCommentList', newMyCommentList)
    this.data.tabItem[this.data.currentIndex].list = newMyCommentList
    this.setData({
      tabItem: this.data.tabItem
    })
  },

  // 切换评论和相册
  onChangeTabItem: function (e) {
    console.log('onChangeTabItem', e)
    const { key } = e.detail

    this.setData({
      currentIndex: key
    })

    let currentTabItem = this.data.tabItem[this.data.currentIndex]

    // 切到图片 没有东西 可以加载时
    if (key && !currentTabItem.list.length && !currentTabItem.isNoMore) {
      this.getImageList()
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