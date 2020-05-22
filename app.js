import Auth from './class/api/AuthApi.js'

const auth = new Auth()
App({
  auth:auth,
  globalData:{
    payNum:0, // 支付金额
    recPay:0, //充值金额
    user_no:'', //会员号
    mobile:'', //会员手机号
    orderNo:'', //充值订单号
    device_no:'',//设备序列号
    user_id:"", //刷脸获取的userid
  },
  onLaunch(options) {
    // 第一次打开  获取序列号
    let r = my.ix.getSysPropSync({key: 'ro.serialno'});
    if(r && r.value){
      this.globalData.device_no=r.value
    }

   
  },
  onShow(options) {
    // 从后台被 scheme 重新打开
    // options.query == {number:1}
  },
});
