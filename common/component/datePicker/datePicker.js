// common/component/datePicker/datePicker.js
import FormatUtil from "../../../utils/formatUtil";


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mode : {
      type : String,
      value: 'day'
    },
    minDate : {
      type: String,
      value: '2014-01-01'
    },

    maxDate : {
      type: String,
      value: ''
    },

    /**
     * 默认显示时间
     */
    startDate : {
      type: Number,
      value: new Date().getTime()    
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    selectDate : ''
  },

  ready: function () {
    this.setData({
      selectDate: this._formatDate(this.data.mode, new Date(this.data.startDate))
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
   

    _toggleMonth: function (e) {

      let type = e.currentTarget.dataset.type;
      //计算pre next
      let date = new Date(this.data.selectDate);
      
      //日期模式
      if (this.data.mode == 'month'){
          type == 'pre' ? date.setMonth(date.getMonth() - 1) : date.setMonth(date.getMonth() + 1);         
      }
      else{
        type == 'pre' ? date.setDate(date.getDate() - 1) : date.setDate(date.getDate() + 1);                   
      }

      let dateStr = this._formatDate(this.data.mode, date);
       
      this.setData({
        selectDate: dateStr
      })

      this.triggerEvent('onEventSelectDate', { date: date.getTime()})

    },

    _formatDate: function (mode, date){ 
      let dateFormat = FormatUtil.getDate(date.getTime());
      if(mode == 'day'){
        return `${dateFormat.y}-${dateFormat.M}-${dateFormat.d}`;
      }
      else{
        return `${dateFormat.y}-${dateFormat.M}`;
      }
      
    },

    _onChangeMonth: function (e) {    
      this.setData({
        selectDate: e.detail.value
      })     
      this.triggerEvent('onEventSelectDate', { date: new Date(e.detail.value).getTime() })
    }

  }
})
