//index.js
import User from "./../../api/user";
import Auth from "./../../api/auth";
import CommentSev from "./../../api/comment";
import UserSev from "./../../api/user";
import StorageUtil from "./../../utils/storageUtil";
import FormatUtil from "./../../utils/formatUtil.js";
import NavigationUtil from "./../../utils/navigationUtil.js";
import Config from "./../../config";
import { $stopWuxRefresher, $wuxActionSheet, $wuxToast, $wuxDialog } from '../../lib/wux/index';

//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    pageSize: 10,
    pageNum: 1,
    height: 0,
    isNoMore: false,  // 不在加载了
    rankPageNum: [],
    commentList: [],
    buttons: [{
      label: '发说说',
      icon: 'http://static.weqianduan.com/icon-editor.png',
      type: 'text'
    // },
    // {
    //   label: '图片',
    //   icon: 'http://static.weqianduan.com/icon-camera.png',
    //   type: 'picture'
    }
    ],
    position: 'bottomRight',
    showEditPopup: false,  // 显示新增评论弹窗
    systemInfo: null,  // 手机信息
    commentContent: '',  // 新增输入内容
    isSecret: false, // 开启匿名
    publishLoading: false,   // 发布状态
    fileList: [],
    uploadUrl: `${Config.SERVER.url.root}/common/upload`
  },

  //事件处理函数
  showCommentDetail: function(e) {
    let commentInfo = e.currentTarget.dataset.commentInfo
    StorageUtil.setStorageSync("commentInfo", commentInfo);
    app.globalData.share = false;
    NavigationUtil.navigateTo('../commentDetail/commentDetail', { id: commentInfo.id } )
    // wx.navigateTo({
    //   url: '../logs/logs'
    // })
  },

  // onshow
  onShow: function () {
    let commentList = StorageUtil.getStorageSync('commentList')
    wx.getSystemInfo({
      success: (res) => {
        // this.setData({
        //   height: res.windowHeight
        // })
        res.model = res.model.split('<')[0].replace(/(^\s*)|(\s*$)/g, "")
        this.setData({
          systemInfo: res,
          height: res.windowHeight
        })
      }
    })
    console.log(commentList)
    if (commentList.length) {
      this.setData({
        commentList: commentList
      })
    }
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
    this.setData({
      commentList: newCommentList
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
    StorageUtil.setStorageSync("commentList", []);
    let userInfo = StorageUtil.getStorageSync('userInfo')
    let self = this
    this.setData({
      spinning: true
    })
    Auth.loginSys().then(res => {
      if (res) {
        StorageUtil.setStorageSync("sessionKey", res.session_key);
        StorageUtil.setStorageSync("openid", res.openid);
        // if (userInfo) {
        //   userInfo.openid = res.openid
        // } else {
        //   userInfo = {
        //     openid: res.openid
        //   }
        // }
        self.findUserByOpenId(res, (result) => {
          app.globalData.userInfo = result
          StorageUtil.setStorageSync("userInfo", result);
          self.setData({
            userInfo: result,
            hasUserInfo: result,
            spinning: false
          })
          console.log(userInfo)
          // 查询评论数据
          self.getCommentList()
        })
      }
    })
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // this.setData({
    //   showEditPopup: false
    // })
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
      StorageUtil.setStorageSync("commentList", this.data.commentList);
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
        // 如果用户被拉黑，不允许发表状态
        if (this.data.userInfo.status == 0) {
          $wuxToast().show({
            type: 'warning',
            duration: 1500,
            color: '#fff',
            text: '您已被列入黑名单，请联系管理员或掌柜~'
          })
        } else {
          this.switchEditPopup(true)
        }
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
        showEditPopup: false,
        fileList: []
      })
    } else {
      self.setData({
        showEditPopup: true,
        fileList: []
      })
    }
    // self.setData({
    //   showEditPopup: !e || e.target
    // })

    // 打开新增
    // if (self.data.showEditPopup) {
    //   wx.getSystemInfo({
    //     success: function (res) {
    //       console.log(res)
    //       if (res) {
    //         res.model = res.model.split('<')[0].replace(/(^\s*)|(\s*$)/g, "")
    //         self.setData({
    //           systemInfo: res
    //         })
    //       }
    //     },
    //     fail: function (err) {
          
    //     },
    //     complete: function (complete) { },
    //   })
    // }
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
    // 判断是否有图片
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
    CommentSev.addComment(param).then(res => {
      console.log(res)
      if (res) {
        this.onRefresh()
        this.setData({
          publishLoading: false,
          commentContent: '',
          fileList: [],
          selectImgs: []
        })
      }
      this.switchEditPopup()
    }, err => {
      console.log(err)
    })
  },

  // 弹出/收回说说功能按钮
  showCommentOptions: function (e) {
    let commentInfo = e.target.dataset.commentInfo
    let self = this
    let btns = []
    if (this.data.userInfo.isAdmin == 1 && !commentInfo.isSelf) {
      btns.push({
        text: '拉黑此人'
      })
    }
    $wuxActionSheet().showSheet({
      titleText: '操作',
      theme: 'wx',
      buttons: btns,
      buttonClicked(index, item) {
        if (index == 0) {
          console.log(commentInfo)
          $wuxDialog().confirm({
            resetOnClose: true,
            closable: true,
            title: '确认操作',
            content: '确认拉黑此人？ta将无法评论或者发表说说',
            onConfirm(e) {
              wx.showLoading({
                title: '请求中...',
                mask: true
              })
              UserSev.deleteUser({targetId: commentInfo.userInfo.openid}).then(res => {
                if (res && res.data) {
                  wx.hideLoading()
                  $wuxToast().show({
                    type: 'success',
                    duration: 1500,
                    color: '#fff',
                    text: '拉黑成功！'
                  })
                }
                this.cancel()
              })
            },
            onCancel(e) {

            },
          })
        }
        return true
      },
      cancelText: '取消',
      cancel() { },
      destructiveText: '删除',
      destructiveButtonClicked() {
        this.cancel()
        $wuxDialog().confirm({
          resetOnClose: true,
          closable: true,
          title: '确认删除',
          content: '确认删除该条说说？',
          onConfirm(e) {
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
          onCancel(e) {
            
          },
        })
      },
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
            self.updateCommentData('update', v)
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
      if (this.data.showEditPopup) {
        // 填写内容或者纯图片
        if (this.data.commentContent || this.data.fileList.length) {
          this.addNewComment()
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
  },

  // 图片上传相关
  changeImgUpload(e) {
    console.log('changeImgUpload', e)
    const { file } = e.detail
    if (file.status === 'uploading') {
      this.setData({
        progress: 0,
      })
      wx.showLoading({
        title: '上传中，请稍后',
        mask: true
      })
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
    // wx.showModal({
    //   content: '确定删除？',
    //   success: (res) => {
    //     if (res.confirm) {
    //       this.setData({
    //         fileList: fileList.filter((n) => n.uid !== file.uid),
    //       })
    //     }
    //   },
    // })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    return {
      title: '智麦说，只属于智麦鲜啤的朋友圈',
      path: '/pages/index/index',
      imageUrl: "http://static.weqianduan.com/whigestShow2.jpeg",
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
