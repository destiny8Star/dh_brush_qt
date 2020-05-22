import Tips from '../../class/utils/Tips'
const app = getApp()
Page({
  data: {
    amount: 0, //支付金额
    recPay: 0, //充值金额
    user_no: '',//会员卡号
    money: 0,//会员余额
    num: 25, //倒计时
    list: [], //活动list
    it: function() { }
  },

  //返回首页
  out() {
    my.reLaunch({ url: '/pages/index/index' })
  },
  onLoad(option) {
       
   },
  onShow() {
    let that = this
    let amount = app.globalData.payNum;
    let recPay = app.globalData.recPay;
    let user_id =  app.globalData.user_id
    let orderNo = app.globalData.orderNo;
    console.log('orderNo', orderNo)
    this.setData({
      amount: amount,
      recPay: recPay
    })
    setTimeout(function(){//支付宝回调慢，延迟1s再查询
  //获取会员信息
    Tips.loading()
    app.auth.getMer("", orderNo, 1, user_id)
      .then(res => {
        console.log('获取信息', res, amount)
        Tips.loaded()
        that.setData({
          money: res.data.data.money,
          user_no: res.data.data.user_no,
          list: res.data.data.list
        })
      })
      .catch(rej => {
        Tips.loaded()
        Tips.toast(rej.message, 'fail')
      })

    },1000)
    // 倒计时
    // let num = 25;
    // let it = setInterval(function() {
    //   num--;
    //   console.log('nnn', num)
    //   that.setData({
    //     num: num,
    //     it: it
    //   })
    //   if (num <= 0) {
    //     clearInterval(it)
    //     my.reLaunch({ url: '/pages/index/index' })
    //   }
    // }, 1000)

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
