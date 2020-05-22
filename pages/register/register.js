const app = getApp()
import Tips from "../../class/utils/Tips"
Page({
  data: {
    open_id:"",//注册会员时候传递
    mobile:"",//获取手机号
    flag:true, //是否可以点击领卡  true:不可以，false：可以
    cardInfo:'',//会员卡信息
    sign:"",//刷脸获取手机号秘闻
    phone:"",//输入手机号
    code:"",//输入验证码
    wait:false,//等待获取验证码
    codeWoc:"获取验证码",//按钮文字
    is_ali_auto_phone:0,//是否可以一键获取手机号  0不可以，1可以
    it: function() { }
  },
    // 唤起授权
  onGetAuthorize(){
    let that = this
      my.getPhoneNumber({
        success: (res) => {
        //  console.log("同意",res)
         let sign = JSON.stringify(res)
         Tips.loading()
         app.auth.getPhone(sign)
         .then(res=>{
           Tips.loaded()
           let mobile = JSON.parse(res.data.data.ali_content).mobile 
           Tips.toast("获取成功","success")
            that.setData({
                 mobile:mobile,
                 flag:false,
                 sign:sign
               })
           console.log("获取手机号",res)
         })
         .catch(rej=>{
           Tips.loaded()
           Tips.toast(rej.message||'网络异常')
           console.log("失败",rej)
         })
        },
        fail: (res) => {
            console.log(res);
            Tips.toast(res.subMsg||"获取手机号失败")
        },
    });
  },
  onAuthError(e){
   Tips.toast("请授权手机号","fail")
  },
  //领取卡片
  getCard(){
    console.log("获取")
    let is_ali_auto_phone = this.data.is_ali_auto_phone  //是否可以一键获取手机号  0不可以，1可以
     let open_id = this.data.open_id
    Tips.loading()
    if(is_ali_auto_phone){
      let sign = this.data.sign
      app.auth.register("", "", 1, 1, open_id,sign)
      .then(resin => {
        Tips.loaded();
        console.log('resin', resin)
        // app.globalData.mobile = mobile
        my.redirectTo({ url: '/pages/openres/openres' })
      })
      .catch(rejin => {
        Tips.loaded();
        Tips.toast(rejin.message||"领取失败")
        console.log('注册失败', rejin)
      })
    }else{
        let phone = this.data.phone
        let code = this.data.code
        app.auth.register(code, phone, 1, 1, open_id)
        .then(resin => {
          Tips.loaded();
          console.log('resin', resin)
          // app.globalData.mobile = mobile
          my.redirectTo({ url: '/pages/openres/openres' })
        })
        .catch(rejin => {
          Tips.loaded();
          Tips.toast(rejin.message||"领取失败")
          console.log('注册失败', rejin)
        })
    }
 
  },

  //输入
   setPhone(e){
     let code=this.data.code
     console.log("e",e)
     let phone = e.detail.value
     this.setData({
        phone:phone
     })
     let reg = /^1\d{10}$/;
     if( reg.test(phone)&&code){
       this.setData({
        flag:false 
       })
     }else{
         this.setData({
          flag:true 
       })
     }
  },
   setCode(e){
     let phone=this.data.phone
     this.setData({
        code:e.detail.value
     })
    if(e.detail.value&&phone){
       this.setData({
        flag:false 
       })
     }else{
         this.setData({
          flag:true 
       })
     }
  },
  //获取验证码
  getCode(){
      let that = this
      let phone=this.data.phone
      let reg = /^1\d{10}$/;
      if(reg.test(phone)){
           Tips.loading()
            app.auth.getCode(phone)
              .then(res => {
                Tips.loaded()
                Tips.toast("发送成功","success")
                  let n = 60;
                  let it= setInterval(function(){
                      n--
                      that.setData({
                        wait:true,
                        codeWoc:n+"s后重新获取",
                         it: it
                      }) 
                      if(n == 0){
                        clearInterval(it)
                          that.setData({
                            wait:false,
                            codeWoc:"获取验证码"
                          }) 
                      }      
                  },1000)
              })
              .catch(rej => {
                console.log('获取code失败', rej)
                Tips.loaded()
                Tips.toast(rej.message, 'fail')
              })
      }else{
        Tips.toast("请输入正确手机号")
      }
  },
  onShow(){
  //  Tips.loading()
   app.auth.getCardInfo()
   .then(res=>{
     Tips.loaded()
     console.log("获取会员卡信息",res)
     this.setData({
       cardInfo:res.data.data,
       is_ali_auto_phone:res.data.data.is_ali_auto_phone
     })
   }) 
   .catch(rej=>{
     Tips.loaded()
     Tips.toast(rej.message||"网络异常")
     console.log("失败",rej)
   })
  },
  onLoad(q) {
    let open_id =  app.globalData.user_id 
    this.setData({
      open_id:open_id
    })
  },
    //页面卸载
  onUnload() {
    let it = this.data.it
    clearInterval(it) //清除定时器
  },
  onHide() {
    let it = this.data.it
    clearInterval(it) //清除定时器
  }
});
