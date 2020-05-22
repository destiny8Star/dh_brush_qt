import Tips from "../../class/utils/Tips"
const app = getApp()
Page({
  data: {
      cards: [], //卡券信息
      allBtn: false,//一件领取按钮点击后改变
      user_id:"",
      user_no:"",
      istoast:false, //是否显示弹框 true：显示  false：不显示
      mobile:"",//加密后的手机号
      sign:"",//刷脸获取手机号秘闻
      flag:false, //是否可以点击确定 true:可以，false：不可以
      phone:"",//输入手机号
      code:"",//输入验证码
      wait:false,//等待获取验证码
      codeWoc:"获取验证码",//按钮文字
      is_ali_auto_phone:0,//是否可以一键获取手机号  0不可以，1可以
      it: function() { },//定时器
  },
    //单个领取
  getCard(coupon_id,user_no){
    Tips.loading()
    app.auth.toGet(coupon_id, user_no)
      .then(res => { //1:领取成功
        Tips.loaded()
        console.log('领取成功', res)
        let cards = this.data.cards
        let id = res.data.data[0].coupon_id
        let status = res.data.data[0].status
        let newCards = cards.map(function(item) {
          // console.log('item', item)
        if (item.id == id) {
            item.status = status
          }
          return item
        })
        this.setData({
          cards: newCards
        })
        // console.log(cards,newCards)
        if (status == 1) {
          Tips.toast('领取成功')
        } else {
          Tips.toast('领取失败', 'fail')
        }

      })
      .catch(rej => {
        Tips.loaded()
        console.log('领取失败', rej)
        Tips.toast(rej.message, 'fail')
      })
  },
  //单个领券
  toGet(e) {
    let id = e.currentTarget.dataset.id
    let coupon_id = [id];

    let user_no = this.data.user_no
    if (!user_no) {
        //不存在就弹框出来注册
        this.setData({
          istoast:true,
        }) 
        return 
    }
    console.log('id', id, coupon_id, user_no)
    this.getCard(coupon_id,user_no)
  },
  //领取全部
  getCardAll(user_no){
    let cards = this.data.cards
    let newCards = cards.slice(0)
    let coupon_id = [];

    cards.forEach(function(e) {
      if (e.status == undefined) {
        coupon_id.push(e.id)
      }
    })
    console.log('id', cards, coupon_id)
    if (coupon_id.length == 0) {
      return Tips.toast('无可领取的卡券', 'fail')
    }
    Tips.loading()
    app.auth.toGet(coupon_id, user_no)
      .then(res => { //1:领取成功
        Tips.loaded()
        console.log('领取成功', res)

        let datas = res.data.data
        datas.forEach(function(e) {
          newCards.forEach(function(ine) {
            if (ine.id == e.coupon_id) {
              ine.status = e.status
            }
          })
        })
        console.log('领取后的cards', this.data.cards,cards,newCards)
        this.setData({
          cards: newCards,
          allBtn: true
        })
      })
      .catch(rej => {
        Tips.loaded()
        console.log('领取失败', rej)
        Tips.toast(rej.message, 'fail')
      })
  },
  //多个领券
    toGetAll() {
    let user_no = this.data.user_no
    if (!user_no) {
        //不存在就弹框出来注册
        this.setData({
          istoast:true,
        }) 
        return 
    }
    this.getCardAll(user_no)
  },
      // 唤起授权
  onGetAuthorize(){
    let that = this
      my.getPhoneNumber({
        success: (res) => {
         console.log("同意",res)
         let sign = JSON.stringify(res)
         Tips.loading()
         app.auth.getPhone(sign)
         .then(res=>{
           Tips.loaded()
           let mobile = JSON.parse(res.data.data.ali_content).mobile 
           Tips.toast("获取成功","success")
            that.setData({
                 mobile:mobile,
                 flag:true,
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
  //确定注册
  register(){
    console.log("获取")
    let flag = this.data.flag
    if(!flag) return ;
    let is_ali_auto_phone = this.data.is_ali_auto_phone  //是否可以一键获取手机号  0不可以，1可以
    let user_id = this.data.user_id
    Tips.loading()
    if(is_ali_auto_phone){
      let sign = this.data.sign
      app.auth.register("", "", 2, 1, user_id,sign)
      .then(resin => {
        Tips.loaded();
        console.log('resin', resin)
        Tips.toast("手机号获取成功")
        this.setData({
          istoast:false,
          user_no:resin.data.data
        })
        // my.redirectTo({ url: '/pages/openres/openres' })
      })
      .catch(rejin => {
        Tips.loaded();
        Tips.toast(rejin.message||"网络异常")
        console.log('注册失败', rejin)
      })
    }else{
        let phone = this.data.phone
        let code = this.data.code
        app.auth.register(code, phone, 2, 1, user_id)
        .then(resin => {
          Tips.loaded();
          Tips.toast("手机号获取成功")
           this.setData({
              istoast:false,
              user_no:resin.data.data
            })
          console.log('resin', resin)
          // my.redirectTo({ url: '/pages/openres/openres' })
        })
        .catch(rejin => {
          Tips.loaded();
          Tips.toast(rejin.message||"网络异常")
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
        flag:true 
       })
     }else{
         this.setData({
          flag:false 
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
        flag:true 
       })
     }else{
         this.setData({
          flag:false 
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
              .then(() => {
                Tips.loaded()
                Tips.toast("发送成功","success")
                  let n = 60;
                  let it= setInterval(function(){
                      n--
                      that.setData({
                        wait:true,
                        codeWoc:n+"s后重新获取",
                        it:it
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
  onLoad() {},
  onShow(){
     let user_no = app.globalData.user_no
     let user_id = app.globalData.user_id
     this.setData({
       user_no:user_no,
       user_id:user_id
     })
    // Tips.loading()
    Promise.all([app.auth.getCardInfo(),app.auth.getMerCard()])
    .then(res=>{
       Tips.loaded()
      console.log('alll信息',res)
       this.setData({
         is_ali_auto_phone:res[0].data.data.is_ali_auto_phone,
         cards: res[1].data.data
        })
    })
    .catch(rej=>{
       Tips.loaded()
        console.log('失败', rej)
        Tips.toast(rej.message, 'fail')
    })

    //监听键盘事件
    my.ix.onKeyEventChange((r) => {
      if (r.keyCode == 133) {
        my.reLaunch({ url: '/pages/index/index' })
      } 
    });
  },
  //取消
  cancel(){
     this.setData({
          istoast:false
        }) 
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
