import Tips from '../../class/utils/Tips'
const app = getApp()
Page({
  data: {
    amount:0,
    money:'', //会员余额
    user_no:'', //会员号 支付用
    mobile:'', //会员手机号
    smobile:'',//展示的手机号
    num:15, //倒计时
    it:function(){}
  },
   //会员支付
  memPay(){
     let user_no = this.data.user_no
      let amount = this.data.amount
      Tips.loading()
      app.auth.merpay(amount,user_no)
      .then(res=>{
        Tips.loaded()
        console.log('支付结果',res)

        if(res.data.data.code == 'SUCCESS'){
           let list = JSON.stringify(res.data.data.list) 
          my.reLaunch({url:'/pages/payres/payres?list='+list});
          } 
        else{Tips.toast(res.data.data.msg,'fail')}
        
      })
      .catch(rej=>{
        Tips.loaded()
        Tips.toast('网络异常','fail')
        console.log('支付失败',rej)
      })
    // Tips.alert('会员支付成功',function(){
    //   my.redirectTo({url:'/pages/payres/payres'})
    // })
  },
  //返回首页
  out(){
    my.reLaunch({url:'/pages/index/index'})
  },
  onLoad() {},
  onShow(){
     let amount = app.globalData.payNum;
     let mobile = app.globalData.mobile;
     let s1 = mobile.slice(0,3)
     let s2 = mobile.slice(-4)
     let smobile = s1+'****'+s2
     //获取会员信息
     Tips.loading()
     app.auth.getMer(mobile)
     .then(res=> {
        Tips.loaded()
        this.setData({
          money:res.data.data.money,
          user_no:res.data.data.user_no,
          mobile:mobile,
          amount:amount,
          smobile:smobile
        }) 
      })
      .catch(rej=>{
        Tips.loaded()
        Tips.toast(rej.message,'fail')
      })
      //倒计时
    let that = this
    let num = 15;
    let it = setInterval(function(){
       num --;
       console.log('nnn',num)
       that.setData({
         num:num,
         it:it
       })
       if(num <= 0){
         clearInterval(it)
         my.reLaunch({url:'/pages/index/index'})
       }
    },1000)  
   
  },
       //页面卸载
  onUnload(){
     let it = this.data.it
    clearInterval(it) //清除定时器
  },
   onHide() {
      let it = this.data.it
    clearInterval(it) //清除定时器
  }
});
