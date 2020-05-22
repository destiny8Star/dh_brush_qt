import Tips from '../../class/utils/Tips'
const app = getApp()
Page({
  data: {
    amount:'', //支付金额
    money:'', //会员余额
    user_no:'', //会员号 支付用
    mobile:'', //会员手机号
    smobile:'',//展示的手机号
    num:15, //倒计时
    it:function(){}
  },
  //支付
  toPay(amount){
      let bizNo=new Date().getTime()
      my.ix.startApp({
        appName: 'cashier',
        bizNo: bizNo,
        showScanPayResult:true,
        totalAmount: amount,
        orderDetail: [],
        success: (r) => {
          // console.log('收银台返回扫脸码',r);
          let user_no = this.data.user_no
           app.auth.pay(r.barCode ,amount, user_no)
           .then(res=>{
             console.log('支付',res)
               if(res.data.data.code=='SUCCESS'){
                 app.globalData.orderNo = res.data.data.orderNo
                  //打印
                  if(res.data.data.payType == "ALIPAY"){
                    app.auth.ixPrint(res.data.data.orderNo,amount,"al")
                  }else{
                    app.auth.ixPrint(res.data.data.orderNo,amount,"wx")
                  }
                    if(r.codeType == 'C'){
                        //监听刷卡的
                      this.resCard(bizNo,amount)
                      my.navigateTo({url:'/pages/recharge/recharge'});
                       //刷脸监听收银台退出的
                      // this.resHand()
                    }else{
                      my.navigateTo({url:'/pages/recharge/recharge'});
                    }
                  }else{
                    console.log('等待支付',res)
                    let datas = JSON.stringify(res.data.data)
                   Tips.toast(res.data.data.msg,"fail",function(){
                          my.redirectTo({url:'/pages/unusual/unusual?datas='+datas+'&&way=2'});
                    }) 
                 }
           })
           .catch(rej=>{
             console.log('失败',rej)
             Tips.toast('网络异常',"fail")
           })
        },
        fail:(r)=>{
          console.log("api失败",r)
          if(r.errorMessage == "null(Z1008)"){
            Tips.toast('支付取消','exception')
          }else{
            Tips.toast(r.errorMessage,"exception")
          }
        }
      });
  },
  /**
   * 支付结果处理
   */
 resHand(){
     // 监听收银台
      my.ix.onCashierEventReceive((r) => {
        if (r.bizType = 'RESULT_CLOSED'){
           console.log('收银台关闭')
           my.ix.offCashierEventReceive();
          //  let datas = JSON.stringify({subCode:'YES'})
          //  my.redirectTo({url:'/pages/unusual/unusual?way=2&&datas='+datas});
          my.redirectTo({url:'/pages/recharge/recharge'});
        }else{
          console.log('监听收银台')
        }
      });
  },
  resCard(bizNo,amount){
        console.log('刷卡结果')
      my.ix.startApp({
          appName: 'scanPayResult',
          bizNo: bizNo,
          totalAmount: amount,
      });    
  },
   //返回首页
  out(){
    my.reLaunch({url:'/pages/index/index'})
  },

  onLoad(o) {
  }, 
  onShow(){
      // let mobile = app.globalData.mobile;
      // let s1 = mobile.slice(0,3)
      // let s2 = mobile.slice(-4)
      // let smobile = s1+'****'+s2
      let user_id =  app.globalData.user_id
      console.log("获取userid",user_id)
     //获取会员信息
     Tips.loading()
     app.auth.getMer("",  "",  1, user_id)
     .then(res=> {
       console.log('成功',res)
        Tips.loaded()
        this.setData({
          money:res.data.data.money,
          user_no:res.data.data.user_no,
          // mobile:mobile,
          // smobile:smobile
        }) 
      })
      .catch(rej=>{
        console.log("事变",rej)
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
    // 键盘监听
      my.ix.onKeyEventChange((r) => {

        console.log('键盘',r)
      if (r.keyCode == 131){
       let mon = r.amount 
        let reg = /\./
        if(reg.test(mon)){
           mon=mon.slice(0,mon.indexOf('.')+3)
        }
        if(mon == 0){
           return  Tips.toast('请输入正确金额','fail')
        }
         let it = this.data.it
       clearInterval(it) //清除定时器
        
        app.globalData.recPay = mon
        this.toPay(mon)
      
         
      }else{
        // console.log('其他键盘113 /57')
      }
    });
  },
  //页面卸载
  onUnload() {
    let it = this.data.it
    clearInterval(it) //清除定时器
    my.ix.offKeyEventChange();
  },
  onHide() {
     let it = this.data.it
     clearInterval(it) //清除定时器
     my.ix.offKeyEventChange();
  }
});
