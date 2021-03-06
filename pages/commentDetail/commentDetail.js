//commentDetail.js
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
  data: {
    userInfo: {},
    hasUserInfo: false,
    commentInfo: {},
    tabItem: [{
      key: 0,
      value: 0,
      title: '评论 0'
    }, {
        key: 1,
        value: 0,
        title: '点赞 0'
      }],
    currentTab: 0,
    pageSize: 10,
    pageNum: 1,
    height: 0,
    rankPageNum: [],
    discussList: [],
    discussTotal: 0,
    showEditPopup: 0,  // 显示新增评论弹窗
    publishLoading: false,   // 发布状态
    isNoMore: false,  // 不在加载了
    fileList: [],
    uploadUrl: `${Config.SERVER.url.root}/common/upload`,
    share: false
  },
  onShow: function () {
    this.setData({
      share: app.globalData.share
    })
    // wx.getSystemInfo({
    //   success: (res) => {
    //     this.setData({
    //       height: res.windowHeight - 600
    //     })
    //   }
    // })
  },

  onLoad: function (options) {
    let commentInfo = StorageUtil.getStorageSync('commentInfo')
    let userInfo = StorageUtil.getStorageSync('userInfo')
    let commentId = options.id
    // 如果缓存有值，先取缓存
    if (commentInfo && commentInfo.id == commentId) {
      console.log(commentInfo)
      this.setData({
        commentInfo: commentInfo,
        discussTotal: commentInfo.discussCount
      })
    }
    console.log(options)
    let self = this
    if (userInfo) {
      self.setData({
        userInfo: userInfo,
        hasUserInfo: userInfo
      })
      self.refreshAllData(commentId)
    } else {
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
          self.refreshAllData(commentId)
        }
      })
    }
  },

  // 刷新当前页面所有数据
  refreshAllData: function (commentId) {
    this.setData({
      pageNum: 1,
      pageSize: 10,
      isNoMore: false,
      discussList: []
    })
    CommentSev.findCommentByCommentId(commentId).then(res => {
      console.log(res)
      if (res && res.data) {
        let commentInfo = res.data
        commentInfo.fmtCreateTime = FormatUtil.getFullDate(commentInfo.createTime, '.')
        if (commentInfo.source) {
          commentInfo.source = commentInfo.source.split('<')[0].replace(/(^\s*)|(\s*$)/g, "")
        }
        this.setData({
          commentInfo: commentInfo
        })
        if (commentInfo.content) {
          NavigationUtil.setNavigationBarTitle(commentInfo.content)
        }
        this.getDiscussList()
      } else {
        $wuxToast().show({
          type: 'forbidden',
          duration: 1500,
          color: '#fff',
          text: '该条说说不存在或者已删除'
        })
        this.setData({
          share: true
        })
      }
      
    })
  },

  // 预览列表图片
  previewImgs: function (e) {
    let imgUrl = e.currentTarget.dataset.imgUrl
    let imgList = e.currentTarget.dataset.imgList
    wx.previewImage({
      current: imgUrl,
      urls: imgList
    })
  },

  // 预览单张图片
  previewOneImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: [current] // 需要预览的图片http链接列表  
    })
  },

  // 预览评论图片
  previewDiscussImgs: function (e) {
    let imgUrl = e.currentTarget.dataset.imgInfo
    wx.previewImage({
      current: imgUrl,
      urls: [imgUrl]
    })
  },

  // 切换评论和点赞
  onChangeTabItem: function (e) {
    console.log('onChangeTabItem', e)
    this.setData({
      currentTab: e.detail.key,
    })
  },

  // 弹出/收回说说功能按钮
  showCommentOptions: function (e) {
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
        CommentSev.deleteComment(self.data.commentInfo.id).then(res => {
          if (res && res.data) {
            wx.hideLoading()
            $wuxToast().show({
              type: 'success',
              duration: 1500,
              color: '#fff',
              text: '删除成功！'
            })
            self.setData({
              commentInfo: {},
              share: true
            })
            self.updateCommentData('delete')
            setTimeout(() => {
              NavigationUtil.navigateBack('/pages/index/index');
            }, 1500)
          }
          this.cancel()
        })
      },
    })
  },

  // 评论列表中筛选出删掉的
  removeRowInDiscussList: function (id) {
    for (let i = 0; i < this.data.discussList.length; i++) {
      if (this.data.discussList[i].id == id) {
        this.data.discussList.splice(i, 1)
        i--
      }
    }
    this.setData({
      discussList: this.data.discussList
    })
  },

  // 弹出、收回评论功能按钮
  showDiscussOptions: function (e) {
    console.log(e)
    let discussInfo = e.target.dataset.discussInfo
    let self = this
    $wuxActionSheet().showSheet({
      titleText: '删除评论',
      buttons: [],
      buttonClicked(index, item) {
        return true
      },
      cancelText: '取消',
      cancel() { },
      destructiveText: '删除',
      destructiveButtonClicked() {
        console.log(discussInfo)
        DiscussSev.deleteDiscuss(discussInfo.id).then(res => {
          if (res && res.data) {
            self.removeRowInDiscussList(discussInfo.id)
            self.data.discussTotal--
            self.setData({
              discussTotal: self.data.discussTotal
            })
            // self.refreshAllData(self.data.commentInfo.id)
            $wuxToast().show({
              type: 'success',
              duration: 1500,
              color: '#fff',
              text: '删除成功！'
            })
            self.updateCommentData()
          }
          this.cancel()
        })
      },
    })
  },

  // 格式化数据
  formatCreateTimeList: function (discussList) {
    discussList.forEach((v, i) => {
      // 处理时间
      if (v.createTime) {
        // v.fmtCreateTime = FormatUtil.isToday(v.createTime)
        v.fmtCreateTime = FormatUtil.getFullDate(v.createTime, '.')
        // let fmtObj = FormatUtil.getDateTime(v.createTime)
        // v.fmtCreateTime = `${fmtObj.y}-${fmtObj.M}-${fmtObj.d} ${fmtObj.h}:${fmtObj.m}:${fmtObj.s}`
      }
    })
    return discussList;
  },

  // 加载更多评论列表
  loadRankMore: function () {
    if (!this.data.spinning && !this.data.isNoMore) {
      this.data.pageNum++
      this.setData({
        pageNum: this.data.pageNum
      })
      this.getDiscussList()
    }
  },

  //  更新缓存中说说状态
  updateCommentData: function (type = 'update') {
    let commentList = StorageUtil.getStorageSync('commentList')
    let newCommentList = []
    if (commentList.length) {
      if (type == 'update') {
        newCommentList = commentList.map((v, i) => {
          if (v.id == this.data.commentInfo.id) {
            return v = this.data.commentInfo
          } else {
            return v
          }
        })
      } else if (type == 'delete') {
        for (let i = 0; i < commentList.length; i++) {
          if (commentList[i].id == this.data.commentInfo.id) {
            commentList.splice(i, 1)
            i--
            break
          }
        }
        newCommentList = commentList
      }
    }
    StorageUtil.setStorageSync('commentList', newCommentList)
  },

  // 查询评论列表
  getDiscussList: function () {
    let param = {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
      commentId: this.data.commentInfo.id
    }
    this.data.rankPageNum.push(this.data.pageNum)
    this.setData({
      spinning: true,
      loadMoreText: '请稍后...',
      rankPageNum: this.data.rankPageNum
    })
    DiscussSev.getDiscussList(param).then(res => {
      $stopWuxRefresher()
      if (res && res.data && res.data.rows && res.data.rows.length) {
        if (res.data.rows.length) {
          let resultData = res.data.rows
          // 处理数据
          resultData = this.formatCreateTimeList(resultData)
          let loadMoreText = '加载更多'
          // 如果返回的个数小于pageSize
          if (resultData.length < this.data.pageSize) {
            loadMoreText = '我是有底线的'
            this.setData({
              isNoMore: true
            })
          }
          this.setData({
            discussList: this.data.discussList.concat(resultData),
            discussTotal: res.data.total,
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

    this.refreshAllData(this.data.commentInfo.id)
  },

  // 打开或关闭新增评论弹窗
  switchEditPopup: function (e) {
    console.log(e)
    if (this.data.userInfo.status == 0) {
      $wuxToast().show({
        type: 'warning',
        duration: 1500,
        color: '#fff',
        text: '您已被列入黑名单，请联系管理员或掌柜~'
      })
      return
    }
    let status = parseInt(e.target.dataset.popupType)
    let self = this
    self.setData({
      showEditPopup: status,
      fileList: []
    })
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

  // 获取点赞人列表
  getGoodUsersList: function () {
    CommentSev.findGoodListByCommentId(this.data.commentInfo.id).then(res => {
      if (res && res.data) {
        this.data.commentInfo.giveGoodUsers = res.data
        this.setData({
          commentInfo: this.data.commentInfo
        })
      }
    })
  },

  // 从点赞列表中移除取消点赞的人
  removeGoodUser: function () {
    for (let i = 0; i < this.data.commentInfo.giveGoodUsers.length; i++) {
      if (this.data.commentInfo.giveGoodUsers[i].openid == this.data.userInfo.openid) {
        this.data.commentInfo.giveGoodUsers.splice(i, 1)
        i--
        break
      }
    }
    this.setData({
      commentInfo: this.data.commentInfo
    })
  },

  // 点赞请求
  giveGoodAction: function (e) {
    let param = {
      openid: this.data.userInfo.openid,
      commentId: e.target.dataset.commentId
    }
    CommentSev.giveGood(param).then(res => {
      this.data.commentInfo.usedGood = res;
      let currentCommentInfo = this.data.commentInfo
      
      if (res && Object.keys(res).indexOf('data') > -1) {
        // 如果没赞则+1
        if (res.data) {
          currentCommentInfo.goodNum++
          currentCommentInfo.usedGood = true
          this.getGoodUsersList()
        } else {
          // 如果已经赞了则-1
          currentCommentInfo.goodNum--
          currentCommentInfo.usedGood = false
          this.removeGoodUser()
        }
        this.setData({
          commentInfo: currentCommentInfo
        })
      }
      this.updateCommentData()
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

  // 输入内容变化
  changeEnterContent: function (e) {
    this.setData({
      discussContent: e.detail.value
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
  addNewDiscuss: function () {
    let param = {
      commentId: this.data.commentInfo.id,
      content: this.data.discussContent,
      openid: this.data.userInfo ? this.data.userInfo.openid : StorageUtil.getStorageSync('openid'),
      userId: this.data.userInfo ? this.data.userInfo.id : '',
      source: this.data.systemInfo ? this.data.systemInfo.model : '',
      isSecret: this.data.isSecret
    }// 判断是否有图片
    let selectImgs = []
    if (this.data.fileList && this.data.fileList.length) {
      this.data.fileList.forEach((v, i) => {
        if (v.res && v.res.data) {
          let realRes = JSON.parse(v.res.data)
          if (realRes.status == 200) {
            selectImgs.push(realRes.data.imgUrl)
          }
        }
      })
    }
    param.images = selectImgs
    this.setData({
      publishLoading: true
    })
    DiscussSev.addDiscuss(param).then(res => {
      if (res) {
        this.onRefresh()
        this.updateCommentData()
        this.setData({
          publishLoading: false,
          discussContent: '',
          fileList: []
        })
      }
      this.switchEditPopup(
        {
          target: {
            dataset: {popupType: 0}
          }
        }
      )
    }, err => {
      this.setData({
        publishLoading: false,
      })
      console.log(err)
    })
  },

  // 发布消息
  publishDiscuss: function (e) {
    this.getUserInfo(e, res => {
      if (res) {
        // 如果发布窗口已打开并且有内容，则直接发布
        if (this.data.showEditPopup) {
          // 填写内容或者纯图片
          if (this.data.discussContent || this.data.fileList.length) {
            this.addNewDiscuss()
          } else {
            $wuxToast().show({
              type: 'forbidden',
              duration: 1500,
              color: '#fff',
              text: '写点东西吧'
            })
          }
        } else {
          $wuxToast().show({
            type: 'forbidden',
            duration: 1500,
            color: '#fff',
            text: '写点东西吧'
          })
        }
      }
    })
  },

  // 获取用户授权
  getUserInfo: function (e, fn) {
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


  // 图片上传相关
  changeImgUpload(e) {
    console.log('changeImgUpload', e)
    const { file } = e.detail
    if (file.status === 'uploading') {
      this.setData({
        progress: 0,
      })
      wx.showLoading()
    } else if (file.status === 'done') {
      this.setData({
        imageUrl: file.url,
      })
    }
  },
  imgUploadSuccess(e) {
    console.log('imgUploadSuccess', e)
    let fileDetail = e.detail
    this.setData({
      fileList: fileDetail.fileList
    })
  },
  imgUploadFail(e) {
    console.log('imgUploadFail', e)
  },
  imgUploadComplete(e) {
    console.log('imgUploadComplete', e)
    wx.hideLoading()
  },
  imgUploadProgress(e) {
    console.log('imgUploadProgress', e)
    this.setData({
      progress: e.detail.file.progress,
    })
  },
  imgUploadPreview(e) {
    console.log('imgUploadPreview', e)
    const { file, fileList } = e.detail
    wx.previewImage({
      current: file.url,
      urls: fileList.map((n) => n.url),
    })
  },
  imgUploadRemove(e) {
    const { file, fileList } = e.detail
    this.setData({
      fileList: fileList.filter((n) => n.uid !== file.uid),
    })
    console.log(this.data.fileList)
  },

  // 返回主页
  backToHome () {
    NavigationUtil.switchTab('/pages/index/index')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    let title = '智麦说，只属于智麦鲜啤的朋友圈';
    let imageUrl = 'http://static.weqianduan.com/whigestShow2.jpeg';
    let commentInfo = this.data.commentInfo
    if (commentInfo) {
      if (commentInfo.content) {
        title = commentInfo.content
      }
      if (commentInfo.images && commentInfo.images.length) {
        imageUrl = commentInfo.images[0]
      }
    }
    return {
      title: title,
      path: '/pages/commentDetail/commentDetail?id=' + this.data.commentInfo.id,
      imageUrl: imageUrl,
      // success: function (res) {
      //   // 转发成功
      //   // 分享内容 
      //   if (type == '1') {
      //     self.shareToAddCount(2)
      //   } else {
      //     self.shareToAddCount()
      //   }
      // },
      // fail: function (res) {
      //   // 转发失败  
      //   console.log(res)
      // }
    }
  }
})
