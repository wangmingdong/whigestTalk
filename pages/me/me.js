// pages/me/me.js
import User from "./../../api/user";
import Auth from "./../../api/auth";
import CommentSev from "./../../api/comment";
import DiscussSev from "./../../api/discuss";
import StorageUtil from "./../../utils/storageUtil";
import FormatUtil from "./../../utils/formatUtil.js";
import NavigationUtil from "./../../utils/navigationUtil.js";
import Config from "./../../config";
import { $stopWuxRefresher, $wuxActionSheet, $wuxToast, $wuxGallery, $wuxDialog } from '../../lib/wux/index'

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
    identityObj: {
      0: '普通会员',
      1: '管理员',
      2: '掌柜',
      3: '金卡会员',
    },
    editUserInfoModal: false,
    editUserInfoModalBtns: [
      {
        name: '取消'
      },
      {
        name: '确定'
      }
    ],
    newNickName: '' // 修改后昵称
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
        self.findUserByOpenId(res, (result) => {
          if (result) {
            userInfo = result
          }
          app.globalData.userInfo = userInfo
          StorageUtil.setStorageSync("userInfo", userInfo);

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

  getUserInfo: function(e, fn) {
    console.log(e)
    let userInfo = {
      nickName: ''
    };
    let hasUserInfo = false;
    if (e.detail.errMsg.indexOf('getUserInfo:fail') > -1) {
      userInfo = e.detail.userInfo
      hasUserInfo = true;

      if (fn) {
        fn(false)
      }
      return
    }
    this.setData({
      publishLoading: true
    })
    // 先查询用户信息是否存在
    this.queryLogin((res) => {
      // 如果用户存在，执行回调
      if (res.id) {
        if (fn) {
          this.setData({
            publishLoading: false
          })
          fn(true)
        }
      } else {
        // 如果没有则新增
        let userData = Object.assign(e.detail, res)
        console.log(userData)
        User.addUserData(userData).then(result => {
          console.log(result)
          app.globalData.userInfo = result.data
          this.setData({
            userInfo: result.data,
            hasUserInfo: result.data,
            publishLoading: false
          })
          StorageUtil.setStorageSync("userInfo", result.data);
          if (fn) {
            this.setData({
              publishLoading: false
            })
            fn(true)
          }
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
      if (this.data.currentIndex == 1) {
        this.getImageList()
      } else {
        this.getCommentList()
      }
    }
  },

  onRefresh() {
    this.data.tabItem[this.data.currentIndex].pageNum = 1
    this.data.tabItem[this.data.currentIndex].pageSize = 10
    this.data.tabItem[this.data.currentIndex].isNoMore = false
    this.data.tabItem[this.data.currentIndex].list = []
    
    this.setData({
      tabItem: this.data.tabItem
    })
    if (this.data.currentIndex == 1) {
      this.getImageList()
    } else {
      this.getCommentList()
    }
  },

  // 查询评论列表
  getCommentList: function () {
    let currentIndex = this.data.currentIndex
    let currentTabItem = this.data.tabItem[currentIndex]
    let param = {
      pageNum: currentTabItem.pageNum,
      pageSize: currentTabItem.pageSize,
      targetId: this.data.userInfo.openid
    }
    currentTabItem.rankPageNum.push(this.data.tabItem[currentIndex].pageNum)
    this.data.tabItem[currentIndex].spinning = true
    this.data.tabItem[currentIndex].loadMoreText = '请稍后...'
    this.data.tabItem[currentIndex].imgPageNum = this.data.imgPageNum
    this.setData({
      tabItem: this.data.tabItem
    })
    CommentSev.getCommentList(param).then(res => {
      $stopWuxRefresher()
      if (res && res.data && res.data.rows && res.data.rows.length) {
        if (res.data.rows.length) {
          let resultData = res.data.rows
          let loadMoreText = '加载更多'
          // 处理数据
          resultData = this.formatCommentList(resultData)
          // 如果返回的个数小于pageSize
          if (resultData.length < currentTabItem.pageSize) {
            loadMoreText = '我是有底线的'
            this.data.tabItem[currentIndex].loadMoreText = loadMoreText
            this.data.tabItem[currentIndex].isNoMore = true
          }
          this.data.tabItem[currentIndex].list = currentTabItem.list.concat(resultData)
          this.data.tabItem[currentIndex].spinning = false
          this.data.tabItem[currentIndex].loadMoreText = loadMoreText
          this.setData({
            tabItem: this.data.tabItem
          })
        } else {
          this.data.tabItem[currentIndex].isNoMore = true
          this.data.tabItem[currentIndex].spinning = false
          this.data.tabItem[currentIndex].loadMoreText = '我是有底线的'
          this.setData({
            tabItem: this.data.tabItem
          })
        }
      } else {
        this.data.tabItem[currentIndex].isNoMore = true
        this.data.tabItem[currentIndex].spinning = false
        this.data.tabItem[currentIndex].loadMoreText = '我是有底线的'
        this.setData({
          tabItem: this.data.tabItem
        })
      }
      StorageUtil.setStorageSync("myCommentList", this.data.tabItem[currentIndex].list);
    })
  },

  // 查询图片列表
  getImageList: function () {
    let currentIndex = this.data.currentIndex
    let currentTabItem = this.data.tabItem[currentIndex]
    let param = {
      pageNum: currentTabItem.pageNum,
      pageSize: currentTabItem.pageSize,
      targetId: this.data.userInfo.openid
    }
    currentTabItem.rankPageNum.push(this.data.tabItem[currentIndex].pageNum)
    this.data.tabItem[currentIndex].spinning = true
    this.data.tabItem[currentIndex].loadMoreText = '请稍后...'
    this.data.tabItem[currentIndex].imgPageNum = this.data.imgPageNum
    this.setData({
      tabItem: this.data.tabItem
    })
    CommentSev.queryTargetImages(param).then(res => {
      $stopWuxRefresher()
      if (res && res.data && res.data.rows && res.data.rows.length) {
        if (res.data.rows.length) {
          let resultData = res.data.rows
          let loadMoreText = '加载更多'
          // 如果返回的个数小于pageSize
          if (resultData.length < currentTabItem.pageSize) {
            loadMoreText = '我是有底线的'
            this.data.tabItem[currentIndex].loadMoreText = loadMoreText
            this.data.tabItem[currentIndex].isNoMore = true
          }
          this.data.tabItem[currentIndex].list = currentTabItem.list.concat(resultData)
          this.data.tabItem[currentIndex].spinning = false
          this.data.tabItem[currentIndex].loadMoreText = loadMoreText
          this.setData({
            tabItem: this.data.tabItem
          })
        } else {
          this.data.tabItem[currentIndex].isNoMore = true
          this.data.tabItem[currentIndex].spinning = false
          this.data.tabItem[currentIndex].loadMoreText = '我是有底线的'
          this.setData({
            tabItem: this.data.tabItem
          })
        }
      } else {
        this.data.tabItem[currentIndex].isNoMore = true
        this.data.tabItem[currentIndex].spinning = false
        this.data.tabItem[currentIndex].loadMoreText = '我是有底线的'
        this.setData({
          tabItem: this.data.tabItem
        })
      }
      StorageUtil.setStorageSync("myImageList", this.data.tabItem[currentIndex].list);
    })
  },

  // 预览列表图片
  previewImgs: function (e) {
    let currentTabItem = this.data.tabItem[this.data.currentIndex]
    let imgUrl = e.currentTarget.dataset.imgUrl
    let urls = []
    if (this.data.currentIndex == 1) {
      currentTabItem.list.forEach((v, i) => {
        urls.push(v.img)
      })
      // wx.previewImage({
      //   current: imgUrl,
      //   urls: urls
      // })
      let current = urls.indexOf(imgUrl)
      $wuxGallery().show({
        current,
        urls: currentTabItem.list.map((n) => ({ image: n.img, remark: n.content })),
        showDelete: false,
        indicatorDots: false,
        indicatorColor: '#fff',
        duration: '300',
        classNames: 'wux-animate--fadeIn',
        indicatorActiveColor: '#04BE02'
      })
    } else {
      let imgList = e.currentTarget.dataset.imgList
      wx.previewImage({
        current: imgUrl,
        urls: imgList
      })
    }
    
  },

  // 弹出/收回说说功能按钮
  showCommentOptions: function (e) {
    let commentInfo = e.target.dataset.commentInfo
    let self = this
    $wuxActionSheet().showSheet({
      titleText: '操作',
      buttons: [],
      theme: 'wx',
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

  // 用户信息功能按钮
  showUserOptions: function () {
    this.setData({
      editUserInfoModal: true,
      newNickName: this.data.userInfo.nickName
    })
  },

  // 修改昵称弹窗的按钮点击
  editUserInfoBtn: function (e) {
    console.log(e)
    let { detail } = e
    let self = this
    let btnIndex = detail.index
    if (btnIndex) {
      // yes
      let newNickName = this.data.newNickName
      if (newNickName && newNickName.length) {
        this.data.editUserInfoModalBtns[1].loading = true
        this.setData({
          editUserInfoModalBtns: this.data.editUserInfoModalBtns
        })
        User.updateUserName({ nickName: newNickName }).then(res => {
          self.data.editUserInfoModalBtns[1].loading = false
          self.setData({
            editUserInfoModalBtns: self.data.editUserInfoModalBtns
          })
          if (res && res.data) {
            // 修改成功
            if (res.data.suc) {
              wx.showToast({
                title: '修改成功！',
                icon: 'success',
                duration: 1500
              })
              let userInfo = res.data.userInfo
              app.globalData.userInfo = userInfo

              self.data.tabItem[0].spinning = false
              self.data.tabItem[0].list = []
              self.data.tabItem[0].pageNum = 1
              self.data.tabItem[0].pageSize = 10
              self.setData({
                userInfo: userInfo,
                hasUserInfo: userInfo,
                tabItem: self.data.tabItem,
                editUserInfoModal: false
              })
              StorageUtil.setStorageSync("userInfo", userInfo);
              console.log(userInfo)
              // 查询评论数据
              self.getCommentList()
            } else {
              // 修改失败
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 1500
              })
            }
          }
        })
      }
    } else {
      // cancel
      this.setData({
        editUserInfoModal: false
      })
    }
  },

  // 修改昵称
  changeUserName: function (e) {
    let {detail} = e
    let newNickName = detail.value
    this.setData({
      newNickName: newNickName
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