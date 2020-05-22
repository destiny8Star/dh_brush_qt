const app = getApp()
import Tips from '../../class/utils/Tips'
Page({
  data: {
    amount:'', //支付金额
    coupon_status:0, ////卡券支付入口状态: 0禁用 1启用
    card_status: 0, //会员卡状态 0 是禁用 1是启用
    phone:"",//获取手机号
    isMask:true,//是否隐藏弹框  true:隐藏  false:不隐藏
    token:"",// token 小程序二维码图片用
    apiHost:app.auth.baseURL3,//域名
  },
  //返回首页
  out(){
    my.reLaunch({url:'/pages/index/index'})
  },

  //获取卡券信息 
  getcardInfo(order){
    // console.log("aaa",aaa)
   app.auth.getActivy(order)
      .then(res => {
        let datas = res.data.data
        // have_coupon	卡券推送 1有 0无 
        // have_marketing_activy	符合条件的抽奖项 1有 0无  
        // marketing_activy_type 1：大转盘，2：刮刮卡 
        if(datas.have_coupon || datas.have_marketing_activy){
          my.reLaunch({url:'/pages/verify/verify?type='+datas.marketing_activy_type+"&status=1"});
        }else{
           my.reLaunch({url: '/pages/index/index'})
        }
        console.log('获取跳转状态', res,datas)
      })
      .catch(rej => {
        console.log('卡券失败', rej)
         Tips.toast(rej.message, 'fail',function(){
            my.reLaunch({url: '/pages/index/index'});
        })
      })
  },
  //支付
  toPay(){
      let amount = this.data.amount
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
                      Tips.toast(res.data.data.message||"网络异常","fail")
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

  //去核身
   toCheck(){
     return new Promise((res,rej)=>{
          my.ix.faceVerify({
          option: 'life',
          success: (r) => {
            let open_id = r.buyerId
            app.globalData.user_id = open_id
            res(open_id)
            console.log('核身success',r,open_id)
          },
          fail: (r) => {
            console.log('fail',r)
            rej(r)
          }
        });
     })
   
  },
  //会员支付
  toMem(){
    // my.navigateTo({url:'/pages/memcheck/memcheck'})
    this.toCheck()
    .then(res=>{
      console.log("调用结果",res)
       app.auth.getMer("",  "",  1, res)  //mobile,orderNo,user_tag,open_id,type
        .then(res=>{
          console.log("获取会员信息",res)
            app.globalData.user_no = res.data.data.user_no
            // app.globalData.mobile = res.data.data.mobile
            my.redirectTo({ url: '/pages/mempay/mempay' })
        })
        .catch(rej=>{
          console.log("失败",rej)
           if(rej.code == 1002){
              my.navigateTo({url:"/pages/register/register"})
           }else{
              Tips.toast(rej.message||'网络异常')
           }
        })
    })
    .catch(rej=>{
      console.log("调用失败",rej)
      Tips.toast(rej.message||"网络异常","fail")
    })
 
  },
  //去卡券支付
  toCard(){
    this.toCheck()
    .then(res=>{
        app.auth.getMer("",  "",  2, res) 
        .then(res=>{
          console.log("获取会员信息",res)
            app.globalData.user_no = res.data.data.user_no
            my.redirectTo({url : '/pages/smempay/smempay'});
        })
        .catch(rej=>{
          console.log("失败",rej)
           if(rej.code == 1002){
              app.globalData.user_no = ""
              my.redirectTo({url : '/pages/smempay/smempay'});
           }else{
              Tips.toast(rej.message||'网络异常')
           }
        })
    })
    .catch(rej=>{
      console.log("调用失败",rej)
      Tips.toast(rej.errorMessage||"网络异常","fail")
    })
    // my.navigateTo({url:'/pages/scheck/scheck'})
  },
  //隐藏弹框
  hideMask(){
     this.setData({
       isMask:true
     })
  },
  onLoad(o) {
    console.log('传递参数',o)
    let coupon_status = o.coupon_status
    let card_status = o.card_status
    let amount = app.globalData.payNum;
   
   //从缓存中获取商户信息,判断是否是开启新零售的商户，是的话弹框 0否 , 1是
    let is_new_retail = my.getStorageSync({key: 'infos'}).data.is_new_retail
    let token = my.getStorageSync({key: 'token'}).data
    console.log("info",is_new_retail)
    if(is_new_retail){
        this.setData({
            token:token,
            isMask:false
        })
    }

    this.setData({
      coupon_status:coupon_status,
      card_status:card_status,
      amount:amount
    })
  },
  onShow(){
     // # 开始接收指令
    my.ix.startMonitorTinyCommand({
      success: (r) => {
        console.log("success",r);
      },
      fail: (r) => {
        console.log("fail, errorCode:" + r.error);
      }
    });
    
    // // # 等待指令的接收
    my.ix.onMonitorTinyCommand((r) => {
      console.log("received data:", r);
      app.globalData.payNum = r.totalAmount
      this.setData({
        amount:r.totalAmount
      })
    });

 
    // console.log('amont',amount)
       //监听键盘事件
    my.ix.onKeyEventChange((r) => {
      if (r.keyCode == 133) {
        my.navigateBack(-1)
      } 
    });
  },
    //页面卸载
  onUnload() {
     my.ix.offKeyEventChange();
      // # 结束接收指令
    my.ix.offMonitorTinyCommand({
      success: (r) => {
        console.log("success",r);
      },
      fail: (r) => {
        console.log("fail, errorCode:" + r.error);
      }
    });
  },
  onHide() {
    my.ix.offKeyEventChange();
     // # 结束接收指令
    my.ix.offMonitorTinyCommand({
      success: (r) => {
        console.log("success",r);
      },
      fail: (r) => {
        console.log("fail, errorCode:" + r.error);
      }
    });
  }
});
