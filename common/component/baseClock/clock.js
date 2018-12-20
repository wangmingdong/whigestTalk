// common/component/clock/clock.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
     
  },

  /**
   * 组件的初始数据
   */
  data: {
    exTime : '',
    timeStr : ''
  },

  attached : function(){
      
  },

  detached : function(){
    this.end();
  },

  /**
   * 组件的方法列表
   */
  methods: {

    start : function(startTime){    

      if(this.timer){
        this.end();
      }

      this.exTime = startTime || new Date().getTime();
      //初始
      this._execute();
      this.timer = setInterval(() => { this._execute()}, 1000);
     
    },

    end : function(){
      if(this.timer){
        clearInterval(this.timer);
        this.timer = null;
      }
        
    },

    _execute : function(){   

      this.exTime = this.timer ? this.exTime + 1000 : this.exTime;
      let date  = new Date(this.exTime);
      let hour = date.getHours() <= 9 ? "0" + date.getHours() : date.getHours();
      let min = date.getMinutes() <= 9 ? "0" + date.getMinutes() : date.getMinutes();
      let sec = date.getSeconds() <= 9 ? "0" + date.getSeconds() : date.getSeconds();
      let timeStr = `${hour}:${min}:${sec}`;
      this.setData({      
        timeStr: timeStr
      });
    }
  }
})
