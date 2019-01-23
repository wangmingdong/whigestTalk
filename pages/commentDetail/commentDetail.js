//commentDetail.js
import User from "./../../api/user";
import Auth from "./../../api/auth";
import CommentSev from "./../../api/comment";
import DiscussSev from "./../../api/discuss";
import StorageUtil from "./../../utils/storageUtil";
import FormatUtil from "./../../utils/formatUtil.js";
import NavigationUtil from "./../../utils/navigationUtil.js";
import { $stopWuxRefresher } from '../../lib/wux/index'

Page({
  data: {
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
    isNoMore: false  // 不在加载了
  },
  onShow: function () {
  },

  onLoad: function (options) {
    let commentInfo = StorageUtil.getStorageSync('commentInfo')
    let commentId = options.id
    // 如果缓存有值，先取缓存
    if (commentInfo) {
      console.log(commentInfo)
      this.setData({
        commentInfo: commentInfo
      })
    }
    console.log(options)
    CommentSev.findCommentByCommentId(commentId).then(res => {
      console.log(res)
      this.onRefresh()
    })
  },

  // 切换评论和点赞
  onChangeTabItem: function (e) {
    console.log('onChangeTabItem', e)
    this.setData({
      currentTab: e.detail.key,
    })
  },

  // 格式化数据
  formatDiscussList: function (discussList) {
    discussList.forEach((v, i) => {
      // 处理时间
      if (v.createTime) {
        // v.fmtCreateTime = FormatUtil.isToday(v.createTime)
        v.fmtCreateTime = FormatUtil.getFullDate(v.createTime, '.')
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
          resultData = this.formatDiscussList(resultData)
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
      discussList: []
    })
    this.getDiscussList()
  }
})
