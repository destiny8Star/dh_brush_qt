import Tips from '../../class/utils/Tips'
const app = getApp()
Page({
  data: {
    amount:'', //支付金额
    // mobile:'', //会员手机号
    // smobile:'',//在页面展示的手机号
    user_no:"", //会员卡号
    num:15, //倒计时
    hasYH:true,  //是否选择使用卡券
    infos:[], //卡券信息
    it:function(){}
  },
    //获取卡券信息 
  getcardInfo(order){
    app.auth.getActivy(order)
      .then(res => {
        let datas = res.data.data
      if(datas.have_coupon || datas.have_marketing_activy){
          my.reLaunch({url:'/pages/verify/verify?type='+datas.marketing_activy_type+"&status=1"});
        }else{
           my.reLaunch({url: '/pages/index/index'})
        }
        console.log('获取推荐的卡券', res,datas)
      })
      .catch(rej => {
        console.log('卡券失败', rej)
         Tips.toast(rej.message, 'fail',function(){
            my.reLaunch({url: '/pages/index/index'});
        })
      })
  },
  //支付
  toPay(amount, id, viewamount){
      let bizNo=new Date().getTime()
      viewamount=String(viewamount)
      console.log("支付传参",amount,id,viewamount)
      my.ix.startApp({
        appName: 'cashier',
        bizNo: bizNo,
        showScanPayResult:true,
        totalAmount: viewamount,
        orderDetail: [],
        success: (r) => {
          if(r.codeType == 'C'){
             //监听刷卡的 
             my.reLaunch({url:"/pages/verify/verify?status=2&amount="+amount+"&barCode="+r.barCode+"&id="+id+"&viewamount="+viewamount});//2是刷卡未支付
          }else{
              app.auth.pay(r.barCode ,amount,'', id)
              .then(res=>{
              console.log('支付',res)
                if(res.data.data.code=='SUCCESS'){
                    app.globalData.payNum = res.data.data.totalPrice//实际支付金额
                    app.globalData.orderNo = res.data.data.orderNo
                     //打印
                    let arg = []    
                    if(viewamount != amount){
                        arg.push(
                          {'cmd':'addText', 'args':['优惠金额：']},
                          {'cmd':'addText', 'args':[(viewamount-amount-0).toFixed(2)]},
                          {'cmd':'addPrintAndLineFeed', 'args':[]},
                          {'cmd':'addText', 'args':['实收金额：']},
                          {'cmd':'addText', 'args':[res.data.data.totalPrice.toFixed(2)]},
                          {'cmd':'addPrintAndLineFeed', 'args':[]},
                        )
                    }
                    if(res.data.data.payType == "ALIPAY"){
                       app.auth.ixPrint(res.data.data.orderNo,amount,"al",arg)
                    }else{
                       app.auth.ixPrint(res.data.data.orderNo,amount,"wx",arg)
                    }
                      this.getcardInfo(res.data.data.orderNo)
                    }else{
                        console.log('等待支付',res)
                        Tips.toast(res.data.data.message||"网络异常","fail")
                  }
            })
            .catch(rej=>{
              console.log('失败',rej)
              Tips.toast('网络异常',"fail")
            })
          }

          //  app.auth.pay(r.barCode, amount, '', id)
          //  .then(res=>{
          //    console.log('卡券支付',res)
          //      if(res.data.data.code=='SUCCESS'){
          //         console.log('走到成功这里')
          //         app.globalData.payNum = res.data.data.totalPrice//实际支付金额
          //          app.globalData.orderNo = res.data.data.orderNo
          //           if(r.codeType == 'C'){
          //              //监听刷卡的
          //             this.resCard(bizNo,viewamount)
          //           }
          //           //打印
          //           let arg = []    
          //           if(viewamount != amount){
          //               arg.push(
          //                 {'cmd':'addText', 'args':['优惠金额：']},
          //                 {'cmd':'addText', 'args':[(viewamount-amount-0).toFixed(2)]},
          //                 {'cmd':'addPrintAndLineFeed', 'args':[]},
          //                 {'cmd':'addText', 'args':['实收金额：']},
          //                 {'cmd':'addText', 'args':[res.data.data.totalPrice.toFixed(2)]},
          //                 {'cmd':'addPrintAndLineFeed', 'args':[]},
          //               )
          //           }
          //           if(res.data.data.payType == "ALIPAY"){
          //              app.auth.ixPrint(res.data.data.orderNo,amount,"al",arg)
          //           }else{
          //              app.auth.ixPrint(res.data.data.orderNo,amount,"wx",arg)
          //           }
          //           //打印结束
          //            this.getcardInfo(res.data.data.orderNo)
          //         }else{
          //           console.log('等待支付',res)
          //           app.globalData.recPay = amount  //在轮询里用来播报用的
          //           let datas = JSON.stringify(res.data.data)
          //          Tips.toast(res.data.data.msg,"fail",function(){
          //                 my.redirectTo({url:'/pages/unusual/unusual?datas='+datas+'&&way=3'});
          //           }) 
          //        }
          //  })
          //  .catch(rej=>{
          //     console.log('失败',rej)
          //     Tips.toast('网络异常',"fail")
          //   })
      
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

  resCard(bizNo,amount){
        console.log('刷卡结果')
      my.ix.startApp({
          appName: 'scanPayResult',
          bizNo: bizNo,
          totalAmount: amount,
      });    
  },
  //支付
  sPay(){
    let amount = this.data.amount;
    let hasYH = this.data.hasYH; //是否选择使用优惠券
    let infos = this.data.infos; 
    console.log('支付金额判断',infos)
    if(infos.length>0 && hasYH){
       let id = infos[0].id
       let viewamount = infos[0].discounted_price //discounted_price优惠后的金额
       this.toPay(amount, id, viewamount)
    }else{
       let viewamount = amount
       this.toPay(amount, '', viewamount)
    }
  },
   //返回首页
  out(){
    my.reLaunch({url:'/pages/index/index'})
  },
  //是否选择使用优惠券
  checkYH(e){
     console.log('youhui',e.detail.value)
     this.setData({
       hasYH:e.detail.value
     })
  },

  onLoad(o) {
  }, 
  onShow(){
     let amount = app.globalData.payNum;
    //  let mobile = app.globalData.mobile;
    let user_no = app.globalData.user_no
    this.setData({
      amount:amount,
      user_no:user_no
    })
    if(user_no) {
    //获取卡券信息
     Tips.loading()
     app.auth.getCard(user_no , amount)
     .then(res=>{
       Tips.loaded()
       this.setData({
         infos:res.data.data
       })
       console.log('获取信息',res)
     })
     .catch(rej=>{
       Tips.loaded()
       console.log('失败',rej)
       Tips.toast(rej.message,'fail')  
     })
    }

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
   onUnload() {
     console.log('页面卸载')
      let it = this.data.it
      clearInterval(it) //清除定时器
  
  },
   onHide() {
     console.log('页面隐藏')
      let it = this.data.it
      clearInterval(it) //清除定时器
    
  }
});
