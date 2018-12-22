//index.js
import User from "./../../api/user";
import Auth from "./../../api/auth";
import CommentSev from "./../../api/comment";
import StorageUtil from "./../../utils/storageUtil";
import FormatUtil from "./../../utils/formatUtil.js";
import { $stopWuxRefresher } from '../../lib/wux/index'

//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    pageSize: 10,
    pageNum: 1,
    height: 0,
    isNoMore: false,  // 不在加载了
    rankPageNum: [],
    commentList: [],
    buttons: [{
      label: '文本',
      icon: 'http://static.weqianduan.com/icon-editor.png',
      type: 'text'
    },
    {
      label: '图片',
      icon: 'http://static.weqianduan.com/icon-camera.png',
      type: 'picture'
    }
    ],
    position: 'bottomRight',
    showEditPopup: false,  // 显示新增评论弹窗
    systemInfo: null,  // 手机信息
    commentContent: '',  // 新增输入内容
    isSecret: false, // 开启匿名
    publishLoading: false   // 发布状态
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  // onshow
  onShow: function () {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          height: res.windowHeight
        })
      }
    })
  },

  // 登录查询
  queryLogin: function (fn) {
    Auth.loginSys().then(res => {
      if (res) {
        StorageUtil.setStorageSync("sessionKey", res.session_key);
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
      }
    })
  },

  onLoad: function () {
    // this.queryLogin()
    let userInfo = StorageUtil.getStorageSync('userInfo')
    let self = this
    Auth.loginSys().then(res => {
      if (res) {
        StorageUtil.setStorageSync("sessionKey", res.session_key);
        StorageUtil.setStorageSync("openid", res.openid);
        if (userInfo) {
          userInfo.openid = res.openid
        } else {
          userInfo = {
            openid: res.openid
          }
        }
        app.globalData.userInfo = userInfo
        self.setData({
          userInfo: userInfo,
          hasUserInfo: userInfo
        })
        console.log(userInfo)
        // 查询评论数据
        self.getCommentList()
      }
    })
    
  },

  // 格式化数据
  formatCommentList: function (commentList) {
    commentList.forEach((v, i) => {
      // 处理时间
      if (v.createTime) {
        // v.fmtCreateTime = FormatUtil.isToday(v.createTime)
        v.fmtCreateTime = FormatUtil.getFullDate(v.createTime, '.')
      }
    })
    return commentList;
  },

  // 加载更多评论列表
  loadRankMore: function () {
    if (!this.data.spinning && !this.data.isNoMore) {
      this.data.pageNum++
      this.setData({
        pageNum: this.data.pageNum
      })
      this.getCommentList()
    }
  },

  // 查询评论列表
  getCommentList: function () {
    let param = {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    }
    this.data.rankPageNum.push(this.data.pageNum)
    this.setData({
      spinning: true,
      loadMoreText: '请稍后...',
      rankPageNum: this.data.rankPageNum
    })
    CommentSev.getCommentList(param).then(res => {
      $stopWuxRefresher()
      if (res && res.data && res.data.rows && res.data.rows.length) {
        if (res.data.rows.length) {
          let resultData = res.data.rows
          // 处理数据
          resultData = this.formatCommentList(resultData)
          let loadMoreText = '加载更多'
          // 如果返回的个数小于pageSize
          if (resultData.length < this.data.pageSize) {
            loadMoreText = '我是有底线的'
            this.setData({
              isNoMore: true
            })
          }
          this.setData({
            commentList: this.data.commentList.concat(resultData),
            spinning: false,
            loadMoreText: loadMoreText
          })
        } else {
          this.setData({
            spinning: false,
            loadMoreText: '我是有底线的',
            isNoMore: true
          })
        }
      } else {
        this.setData({
          spinning: false,
          loadMoreText: '我是有底线的',
          isNoMore: true
        })
      }
    })
  },

  onPulling() {
    console.log('onPulling')
  },
  onRefresh() {
    console.log('onRefresh')
    this.setData({
      pageNum: 1,
      pageSize: 10,
      isNoMore: false,
      commentList: []
    })
    this.getCommentList()
  },

  // 点击浮动按钮
  clickFloatBtn: function (e) {
    let selectBtnInfo = e.detail.value
    console.log(selectBtnInfo.type)
    switch (selectBtnInfo.type) {
      case 'text':
        this.switchEditPopup(true)
        break;
      case 'picture':
        this.switchEditPopup(true)
        break;
      default:
        break;
    }
  },

  // 打开或关闭新增评论弹窗
  switchEditPopup: function (e) {
    console.log(e)
    let self = this
    if (!e || e.target) {
      self.setData({
        showEditPopup: false
      })
    } else {
      self.setData({
        showEditPopup: true
      })
    }
    // self.setData({
    //   showEditPopup: !e || e.target
    // })

    // 打开新增
    if (self.data.showEditPopup) {
      wx.getSystemInfo({
        success: function (res) {
          console.log(res)
          if (res) {
            self.setData({
              systemInfo: res
            })
          }
        },
        fail: function (err) {
          
        },
        complete: function (complete) { },
      })
    }
  },

  // 输入内容变化
  changeEnterContent: function (e) {
    // console.log(e.detail.value)
    this.setData({
      commentContent: e.detail.value
    })
  },

  // 清除手机信息
  clearSystemInfo: function () {
    this.setData({
      systemInfo: {}
    })
  },

  // 开启/关闭匿名
  switchSecret: function (e) {
    console.log(e)
    this.setData({
      isSecret: e.detail.value
    })
  },

  // 新增一条评论
  addNewComment: function () {
    let param = {
      title: '', 
      content: this.data.commentContent, 
      openid: this.data.userInfo ? this.data.userInfo.openid : StorageUtil.getStorageSync('openid'),
      userId: this.data.userInfo ? this.data.userInfo.id : '', 
      source: this.data.systemInfo ? this.data.systemInfo.model : '', 
      isSecret: this.data.isSecret
    }
    this.setData({
      publishLoading: true
    })
    CommentSev.addComment(param).then(res => {
      console.log(res)
      if (res) {
        this.onRefresh()
        this.setData({
          publishLoading: false,
          commentContent: ''
        })
      }
      this.switchEditPopup()
    }, err => {
      console.log(err)
    })
  },

  // 点赞请求
  giveGoodAction: function (e) {
    let param = {
      openid: this.data.userInfo.openid,
      commentId: e.target.dataset.commentId
    }
    console.log(param)
    CommentSev.giveGood(param).then(res => {
      console.log(res)
      if (res && Object.keys(res).indexOf('data') > -1) {
        this.data.commentList.forEach((v, i) => {
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
          }
        })
        this.setData({
          commentList: this.data.commentList
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

  // 发布消息
  publishComment: function (e) {
    this.getUserInfo(e, res => {
      // 如果发布窗口已打开并且有内容，则直接发布
      if (this.data.showEditPopup && this.data.commentContent) {
        this.addNewComment()
      }
    })
  },

  // 获取用户授权
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
    // Auth.loginSys().then(res => {
    //   if (res) {
    //     StorageUtil.setStorageSync("sessionKey", res.session_key);
    //     let userData = Object.assign(e.detail, res)
    //     console.log(userData)
    //     User.addUserData(userData).then(result => {
    //       console.log(result)
    //       app.globalData.userInfo = result.data
    //       this.setData({
    //         userInfo: result.data,
    //         hasUserInfo: result.data
    //       })
    //       StorageUtil.setStorageSync("userInfo", result.data);
    //       if (fn) {
    //         fn(true)
    //       }
    //     })
    //   }
    // })
  }
})
