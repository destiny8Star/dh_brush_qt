const app =getApp()
import Tips from "../../class/utils/Tips"
Page({
  data: {
    url:""
  },
  onLoad(o) {
    let type = o.type
    let path = o.url
    // console.log("o",o,o.type,Boolean(o.url),o.url)
    this.webViewContext = my.createWebViewContext('web-view');
    if(type == 0){
       let h5_url = app.auth.h5_pay  //h5域名,药店
        this.setData({
          url:h5_url+path
        })
    }else{
        let h5_url = app.auth.h5_activy   //h5域名
        console.log("h5",h5_url)
        this.setData({
          url:h5_url+path
        })
    }
    
  },
  onmessage(e) {
  // 接收来自H5的消
   console.log("1h5onshow里",e); 
   let price = e.detail.price
   this.toPay(price)
   // 向H5发送消息  
  // this.webViewContext.postMessage({'sendToWebView': '1aa'});
  },
  onShow(){
         //监听键盘事件
    my.ix.onKeyEventChange((r) => {
      if (r.keyCode == 133) {
        my.reLaunch({url: '/pages/index/index'})
      } 
    });
  },
  //页面卸载
  onUnload() {
     my.ix.offKeyEventChange();
  },
  onHide() {
    my.ix.offKeyEventChange();
  },
 //获取卡券信息 
  getcardInfo(order){
   app.auth.getActivy(order)
      .then(res => {
        let datas = res.data.data
        if(datas.have_coupon || datas.have_marketing_activy){
          my.reLaunch({url:'/pages/verify/verify?type='+datas.marketing_activy_type+"&status=1"});//1是刷脸支付成功
        }else{
           my.reLaunch({url:'/pages/index/index'});
        }
        console.log('获取推荐的卡券', res,datas)
      })
      .catch(rej => {
        console.log('卡券失败', rej)
        Tips.toast(rej.message, 'fail')
      })
  },

  toPay(amount){
      let bizNo=new Date().getTime()
      my.ix.startApp({
        appName: 'cashier',
        bizNo: bizNo,
        showScanPayResult:true,
        totalAmount: amount,
        orderDetail: [],
        success: (r) => {
          console.log('收银台返回扫脸码',r);
          if(r.codeType == 'C'){
             //监听刷卡的 
            my.reLaunch({url:'/pages/verify/verify?status=2&amount='+amount+"&barCode="+r.barCode});//2是刷卡未支付
                    
          }else{
              app.auth.pay(r.barCode ,amount)
              .then(res=>{
              console.log('支付',res)
                if(res.data.data.code=='SUCCESS'){
                    app.globalData.payNum = res.data.data.totalPrice//实际支付金额
                    app.globalData.orderNo = res.data.data.orderNo
                    //打印
                    if(res.data.data.payType == "ALIPAY"){
                        app.auth.ixPrint(res.data.data.orderNo,amount,"al")
                    }else{
                        app.auth.ixPrint(res.data.data.orderNo,amount,"wx")
                    }
                    
                    this.getcardInfo(res.data.data.orderNo)
                      
                    }else{
                      console.log('支付失败',res)
                  }
            })
            .catch(rej=>{
              console.log('失败',rej)
              Tips.toast('网络异常',"fail")
            })
          }
     
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
});
