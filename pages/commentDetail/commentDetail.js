//commentDetail.js
import User from "./../../api/user";
import Auth from "./../../api/auth";
import CommentSev from "./../../api/comment";
import StorageUtil from "./../../utils/storageUtil";
import FormatUtil from "./../../utils/formatUtil.js";
import NavigationUtil from "./../../utils/navigationUtil.js";
import { $stopWuxRefresher } from '../../lib/wux/index'

Page({
  data: {
    commentInfo: {}
  },
  onShow: function () {
    let commentInfo = StorageUtil.getStorageSync('commentInfo')
    console.log(commentInfo)
    this.setData({
      commentInfo: commentInfo
    })
  },

  onLoad: function () {
    
  }
})
