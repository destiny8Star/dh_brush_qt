import Tips from "../../class/utils/Tips"
Page({
  data: {
    status:'未登录',//登录状态
    pSta:"",//打印机状态
  },
  /**
   * 去登录
   */
  toLogin(){
    my.navigateTo({
      url:'/pages/login/login'
    });
  },
  /**
   * 去设置
   */
  toSet(){
      my.ix.startApp({
      appName: 'settings',
    });
  },
  //二维码收款
  toQrcode(){
     console.log("this status",this.data.status)
     if(this.data.status == "未登录"){
       return Tips.toast("请先登录")
     }
     my.navigateTo({
      url:'/pages/qrcode/qrcode'
    });
  },
  //获取打印机状态
  getPrint(){
    let that = this
      Tips.loading()
      my.ix.queryPrinter({
      success: (r) => {
        Tips.loaded()
        if(r.usb.length>0){
          that.setData({
              pSta:"已连接"
            })
        }else{
           that.setData({
              pSta:"未连接"
            })
        }
        console.log("打印机状态",r)
      },
        fail: (r) => {
         Tips.loaded()
         Tips.toast("网络异常")
        console.log("打印机状态",r)
        }
      });
  },
  onLoad() {
  },
  onShow(){
     let token=my.getStorageSync({
      key: 'token', // 缓存数据的key
    });
    if(token.data){
        this.setData({
          status:'已登录',
        })
    }else{
        this.setData({
          status:'未登录'
        })
    }
  }
});
