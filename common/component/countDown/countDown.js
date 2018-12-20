import UI from "../../../utils/uiUtil.js";
var maxTimes = 60;


module.exports = {
  data: {  
    countDownSec: 0,
    isCountDownSubmit: false
  },


  onCountDownDestoryTimer : function(){
    console.log("销毁定时任务")
    if (this.countDownTimer) clearInterval(this.countDownTimer);
    
  },

  onCountDownStopTimer : function(){

    if (this.countDownTimer) clearInterval(this.countDownTimer);

    this.setData({
      isCountDownSubmit: false,
      countDownSec: 0        
    })
        
  },

  /**
   * 获得短信验证码
   */
  onCountDownGetUserPhoneSmsCode: function (event) {   
    let regExp = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[01235678]|18[0-9]|19[89])\d{8}$/;   
    if (!this.data.phoneNum){
      UI.alert("请填写手机号码!");
      return;
    }
    else if (!regExp.test(this.data.phoneNum) ){
      UI.alert("请输入正确手机号码!");
      return;
    }
      this.setData({
        isCountDownSubmit: true,
        countDownSec : maxTimes
      })

      this.countDownTimer = setInterval(()=>{
        if (this.data.countDownSec <= 1){
          this.onCountDownStopTimer();
          return;
        }
        this.setData({
          countDownSec: this.data.countDownSec -1
        })       
        //console.log(this.data.countDownSec);
      },1000);

    if (this.onCountDownStart) this.onCountDownStart();
  }
}