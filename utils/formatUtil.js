import { request, setConfig, Promise } from '../lib/wx-promise-request';
const Format = {


    getDateHasCurrent  : function(time){

        //测试去年
        //time = 1461765373000;

        let current = Format.getDate(new Date().getTime(),'.');
        let next = Format.getDate(time,'.');

        let currentArray = current.split(".");
        let nextArray =  next.split(".");

        //今天
        if(current  ==  next){
            let o = Format.getDateTime(time);
            return `${o.h}:${o.m}`;
        }
        //去年
        else if(nextArray[0]  <  currentArray[0] ){
            return  next;
        }
        else{
            return `${nextArray[1]}.${nextArray[2]}`;
        }

    },

    isToday : function(time,todayTime){
      todayTime = todayTime || new Date().getTime();
      let current = Format.getDate(time, '.');
      let today = Format.getDate(todayTime, '.');
      if (current == today){
        return true;
      }
      return false;
    },

    getDate : function(time,splitStr){

        if(!time) return '';

        var date = new Date(time);
        var M = date.getMonth()+1;
        var y = date.getFullYear();
        var d = date.getDate();

        if(M < 10) M = "0"+M;
        if(d < 10) d = "0"+d;

        if(splitStr)
            return `${y}${splitStr}${M}${splitStr}${d}`;
        else
            return {
                y : y,
                M : M,
                d : d
            };
    },
    
    getFirstAndLastDay: function (date){
      let mon = date.getMonth() + 1;
      //当月天数
      var firstDay= new Date(date.getFullYear(), mon - 1, 1);
      var lastDay = new Date(date.getFullYear(), mon, 0);

     
      return  {
        firstDay: firstDay,
        lastDay: lastDay
      }
    },
    
    getDateTime : function(time){

        var date = new Date(time);
        var M = date.getMonth()+1;
        var y = date.getFullYear();
        var d = date.getDate();
        var h = date.getHours() < 10 ?  0+""+date.getHours() : date.getHours() ;
        var m = date.getMinutes()  < 10 ? 0+""+date.getMinutes() : date.getMinutes();
        var s = date.getSeconds() < 10 ? 0 + "" + date.getSeconds() : date.getSeconds();;

            return {
                y : y,
                M : M,
                d : d,
                h : h,
                m : m,
                s : s
            };
    },


    getFullDate : function(time,split){
        let date = Format.getDate(time,split);
        let tm = Format.getDateTime(time);
        return date + " " + `${tm.h}:${tm.m}`;
    }


}

module.exports  = Format;


