import Tips from '../../class/utils/Tips'
const app = getApp()
Page({
  data: {
    codeText: '获取验证码',
    mobile:'', //手机号
  },
  //获取输入手机号
  getName(e){
     let mobile = e.detail.value;
     this.setData({
       mobile:mobile
     })
  },
  /**
   * 获取验证码
   */
  getCode(){
    let mobile = this.data.mobile;
    let reg = /^1\d{10}$/;
    if(!mobile) return Tips.toast('请输入手机号','fail');
    if(!reg.test(mobile)) return Tips.toast('请输入正确手机号','fail');
    let num = 10;
    let that = this
    let st= setInterval(function(){
      num -- ;
      that.setData({
        codeText:num
      })
      if(num <= 0 ){
        num = 0;
        that.setData({
          codeText:'获取验证码'
        })
        clearInterval(st)   
      }
    },1000)
  },
  //注册
  onSubmit(e){
    console.log(e)
    let mobile = e.detail.value.name
    let pass = e.detail.value.pass
    // if(mobile&&pass)
    my.redirectTo({
      url: '/pages/openres/openres'
    });
  },
   //返回首页
  out(){
    my.reLaunch({url:'/pages/index/index'})
  },
  onLoad() {},
});
