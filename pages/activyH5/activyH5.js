const app =getApp()
Page({
  data: {
    url:""
  },
  onLoad(o) {
    console.log(o);
    // type 1：抽奖活动  2、广告
    // actype 1：转转乐 2、刮刮乐
    let token = my.getStorageSync({ key: 'token' }).data //token  h5页面需要
    let h5_url = app.auth.h5_activy   //h5域名
    if(o.type == 1){
      let order_no = app.globalData.orderNo //订单号， 活动需要
      let actype = o.actype    //活动类型  1：大转盘，2：刮刮卡 0 无
      let route = "";
      actype == 1 ? route = '/#/dialActivity' : route ='/#/scratch'
      console.log("获取订单号",order_no,actype,route)

      this.setData({
        url:h5_url+route+"?token="+token+"&order="+order_no
      })
    }else if(o.type == 2){
       this.setData({
        url:h5_url+"/#/poster?token="+token+"&img="+o.img
      })
    }

    this.webViewContext = my.createWebViewContext('web-view');
  },
  onMessage(e) {
  // 接收来自H5的消
   console.log("1h5onshow里",e); 
   // 向H5发送消息  
  this.webViewContext.postMessage({'sendToWebView': '1aa'});
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
  }
});
