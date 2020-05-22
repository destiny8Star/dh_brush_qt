import Tips from '../../class/utils/Tips'
const app = getApp()
Page({
  data: {
    codeText: '获取验证码',
    mobile: '', //手机号
  },
  //获取输入手机号
  getName(e) {
    let mobile = e.detail.value;
    this.setData({
      mobile: mobile
    })
  },

  //注册
  onSubmit(e) {
    let mobile = e.detail.value.name
    let amount = this.data.amount 
    let reg = /^1\d{10}$/;
    if (mobile) {
      if (!reg.test(mobile)) return Tips.toast('请输入正确手机号', 'fail');
      // Tips.loading()
      app.globalData.mobile = mobile
      my.redirectTo({url : '/pages/smempay/smempay'});

    } else {
      Tips.toast('请输入手机号', 'fail')
    }

  },
  //返回首页
  out() {
    my.reLaunch({ url: '/pages/index/index' })
  },
  onLoad(q) {

  },

});
