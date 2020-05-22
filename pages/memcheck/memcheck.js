import Tips from '../../class/utils/Tips'
const app = getApp()
Page({
  data: {
    codeText: '获取验证码',
    mobile: '', //手机号
    type: '', //f刷脸过来的， s是收款的
  },
  //获取输入手机号
  getName(e) {
    let mobile = e.detail.value;
    this.setData({
      mobile: mobile
    })
  },

  //弹框输入框
  promote(mobile) {
    Tips.pro('已向' + mobile + '发送验证码，请输入', '请输入验证码')
      .then(res => {
        if (res.inputValue) {
          let code = res.inputValue
          Tips.loading()
          app.auth.register(code, mobile)
            .then(resin => {
              Tips.loaded();
              console.log('resin', resin)
              app.globalData.mobile = mobile
              my.navigateTo({ url: '/pages/openres/openres' })
            })
            .catch(rejin => {
              Tips.loaded();
              let that = this
              Tips.toast(rejin.message, 'fail', function() {
                that.promote(mobile)
              })
              console.log('注册失败', rejin)
            }
            )
        } else {
          Tips.toast('请输入验证码!', 'fail')
          this.promote(mobile)
        }
      })
      .catch(rej => console.log('取消', rej))
  },
  //注册
  onSubmit(e) {
    let mobile = e.detail.value.name
    let reg = /^1\d{10}$/;
    if (mobile) {
      if (!reg.test(mobile)) return Tips.toast('请输入正确手机号', 'fail');
      Tips.loading()
      app.auth.getMer(mobile)
        .then(res => {
          Tips.loaded()
          app.globalData.user_no = res.data.data.user_no
          app.globalData.mobile = res.data.data.mobile
          let type = this.data.type
          if (type == 'f') { my.redirectTo({ url: '/pages/facemem/facemem' }) };
          if (type == 's') { my.redirectTo({ url: '/pages/mempay/mempay' }) };
          console.log('获取成功', res, app.globalData)

        })
        .catch(rej => {
          Tips.loaded()
          console.log('获取失败', rej)
          if (rej.code == 1002) {
            Tips.confirm('暂未开通本店会员卡，是否开通', {}, '开通', '退出')
              .then(r => {
                Tips.loading()
                app.auth.getCode(mobile)
                  .then(res => {
                    Tips.loaded()
                    this.promote(mobile)
                  })
                  .catch(rej => {
                    console.log('获取code失败', rej)
                    Tips.loaded()
                    Tips.toast(rej.message, 'fail')
                  })
              })
              .catch(rej => my.navigateBack())
          } else {
            Tips.toast(rej.message, 'fail')
          }
        })
    } else {
      Tips.toast('请输入手机号', 'fail')
    }
    // my.redirectTo({
    //   url: '/pages/openres/openres'
    // });
  },
  //返回首页
  out() {
    my.reLaunch({ url: '/pages/index/index' })
  },
  onLoad(q) {
    let type = q.type || 's'
    console.log(q, type)
    this.setData({
      type: type
    })
  },
});
