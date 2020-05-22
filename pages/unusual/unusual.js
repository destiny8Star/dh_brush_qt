import Tips from '../../class/utils/Tips'
const app = getApp()
Page({
  data: {
    status: 0, //支付装太 0、支付失败  1、等待支付   2、支付成功
    msg: '',  //支付失败的原因
    flag: true,//true 继续  flag 终止
    canCancel:false, //是否可以点击取消   在支付失败后可以点击
  },
  onLoad(q) {
    let datas = JSON.parse(q.datas)
    let way = JSON.parse(q.way)   //1为跳转首页  2为跳转充值成功 3为刷脸支付结果
    console.log('获取参数', datas, way)

    if (datas.subCode == "USERPAYING") {
      //  Tips.loading('等待支付')
      this.setData({
        status: 1,
        msg: datas.msg
      })
      let num = 60;
      this.polling(num, datas.orderNo, way)
    } else if (datas.subCode == "YES") {
      this.setData({
        status: 2,

      })
      setTimeout(function() {
        if (way == 1) {
          my.reLaunch({
            url: '/pages/index/index',
          });
        }
        if (way == 2) {
          my.redirectTo({
            url: '/pages/recharge/recharge',
          });
        }
        if (way == 3) {
          my.redirectTo({
            url: '/pages/verify/verify',
          });
        }

      }, 3000)
    }else{
      this.setData({
        canCancel:true
      })
    }
  },
  onShow() {
    // 键盘监听
    my.ix.onKeyEventChange((r) => {
      let canCancel = this.data.canCancel  //true:可以点击取消  false：不可以
      console.log('键盘', r,canCancel)
      if (r.keyCode == 133 && canCancel) {
        console.log('取消')
        my.reLaunch({url: '/pages/index/index'});
      } else {
        Tips.toast("请等待查询结果")
      }
    });
  },
  onUnload() {
    // 页面隐藏
    console.log("页面卸载")
    my.ix.offKeyEventChange();
  },
  onHide() {
    console.log("页面隐藏")
     this.setData({
      flag:false
    })
    my.ix.offKeyEventChange();
  },
    //获取卡券信息 
    getcardInfo(order){
      Tips.loading()
      app.auth.getActivy(order)
        .then(res => {
        Tips.loaded()
          let datas = res.data.data
        if(datas.have_coupon || datas.have_marketing_activy){
            my.reLaunch({url:'/pages/verify/verify?type='+datas.marketing_activy_type});
          }else{
            my.reLaunch({url: '/pages/index/index'})
          }
          console.log('获取推荐的卡券', res,datas)
        })
        .catch(rej => {
          Tips.loaded()
          console.log('卡券失败', rej)
          Tips.toast(rej.message, 'fail',function(){
              my.reLaunch({url: '/pages/index/index'});
          })
        })
  },

  /**
   * 查询支付结果
   */
  polling(num, order, way) {
    console.log('在轮询', num, order, way)
    let that = this
    let flag = this.data.flag
    let amount = app.globalData.recPay
    if (num > 0 && flag) {
      num -= 2
      //查询结果  
      app.auth.getPayres(order)
        .then(res => {
          console.log('支付结果', res)
          if (res.data.data.code == 'SUCCESS') {
            //打印
            if(res.data.data.payType == "ALIPAY"){
                app.auth.ixPrint(order,amount,"al")
            }else{
                app.auth.ixPrint(order,amount,"wx")
            }
            //  Tips.loaded()
            //语音播报
            my.ix.voicePlay({
              eventId: 'ZFDZ',
              number: amount,
              success: (r) => { console.log('支付结果', r) },
            });

            that.setData({
              status: 2
            })
            setTimeout(function() {
              if (way == 1) {
                my.reLaunch({
                  url: '/pages/index/index',
                });
              }
              if (way == 2) {
                app.globalData.orderNo = res.data.data.orderNo
                my.redirectTo({
                  url: '/pages/recharge/recharge',
                });
              }
              if (way == 3) {
                app.globalData.payNum = res.data.data.totalPrice//实际支付金额
                app.globalData.orderNo = res.data.data.orderNo
                that.getcardInfo(res.data.data.orderNo)
                // app.globalData.orderNo = res.data.data.orderNo
                // my.reLaunch({
                //   url: '/pages/verify/verify',
                // });
              }

            }, 3000)
          } else {
            //支付失败
            if (res.data.data.subCode == "USERPAYING") {
              setTimeout(function() {
                that.polling(num, order, way)
              }, 2000)
            } else {
              // Tips.loaded()
              that.setData({
                msg: res.data.data.msg,
                status: 0,
                canCancel:true
              })

            }
          }
        })
        .catch(rej => {
          console.log('请求失败', rej)
          Tips.toast('网络异常', 'fail')
        })
    } else {
      // Tips.loaded()
      Tips.alert('请收银员确认支付结果', function() {
        my.reLaunch({
          url: '/pages/index/index',
        });
      })
    }
  }
});
