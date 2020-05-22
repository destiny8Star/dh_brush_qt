import Tips from '../../class/utils/Tips'
const app = getApp()
Page({
  data: {
    status:"",    //   1是刷脸支付成功   2是刷卡未支付  3是刷卡支付成功
    payStatus:"1",//支付状态  1、支付中  2、支付成功  3、支付失败
    isNew:false,//是否是新零售商户
    token:"",// token 小程序二维码图片用
    apiHost:app.auth.baseURL3,//域名
    amount: 0, //支付金额
    cards: [], //卡券信息
    newCards:[],//展示的cards
    imgs:"../../imgs/active.png", //广告图片信息
    adds:[],//获取支付后广告
    num: 15, //倒计时
    allBtn: false,//一件领取按钮点击后改变
    user_no: '',//会员卡号
    type:0, //活动类型  1：大转盘，2：刮刮卡 0 无

    istoast:false, //是否显示弹框 true：显示  false：不显示
    mobile:"",//加密后的手机号
    sign:"",//刷脸获取手机号秘闻
    flag:false, //是否可以点击确定 true:可以，false：不可以
    phone:"",//输入手机号
    code:"",//输入验证码
    wait:false,//等待获取验证码
    codeWoc:"获取验证码",//按钮文字
    is_ali_auto_phone:0,//是否可以一键获取手机号  0不可以，1可以

    activies:[
    {
      title:'转转乐',
      cont:'支付后抽好礼',
      btn:'去抽奖',
      image:'../../imgs/v_az.png'
    },{
      title:'刮刮乐',
      cont:'支付后刮好礼',
      btn:'去刮奖',
      image:'../../imgs/v_ag.png'
    }],
    it: function() { },//退出计时器
    it2: function() { },//获取验证码计时器
  },
  //去h5活动 转转乐刮刮乐
  toH5(){
    my.reLaunch({url:'/pages/activyH5/activyH5?type=1&actype='+this.data.type})
  },
  //去h5广告页
  toPoster(){
    let img = this.data.adds[0].poster_h5_url
    if(img){
       let id = this.data.adds[0].ad_id
       let device_no = app.globalData.device_no
       Tips.loading()
        app.auth.doExposure(id,device_no)
        .then(res=>{
          Tips.loaded()
          my.reLaunch({url:'/pages/activyH5/activyH5?type=2&img='+img})
           console.log("成功",res) 
        })
        .catch(rej=>{
          Tips.loaded()
          console.log('失败',rej)
        })
    }
     
  },

//去卡券页--先判断有无userid，有跳转，无 刷脸核身
toCardPage(){
  let user_id = app.globalData.user_id;
  let allBtn = this.data.allBtn
  if(allBtn){
    return 
  }
  if(user_id){
    return my.reLaunch({url:"/pages/coupons/coupons"})
  }
  this.toMem(1)
},
//刷脸核身
toMem(type){ //1为点击去卡券页面的  2为点击注册普通会员
  let that = this
  my.ix.faceVerify({
    option: 'life',
    success: (r) => {
      let open_id = r.buyerId
      app.globalData.user_id = open_id
      console.log('核身success',r,open_id)
      Tips.loading()
      app.auth.getMer("",  "",  2, open_id)  //mobile,orderNo,user_tag,open_id,type
      .then(res=>{
        console.log("获取会员信息",res)
        Tips.loaded()
        app.globalData.user_no = res.data.data.user_no
        if(type == 1){
          my.reLaunch({url:"/pages/coupons/coupons"})
        }else{
          // that.setData({
          //   user_no:res.data.data.user_no
          // })
          that.getCardAll(res.data.data.user_no)
        }
      })
      .catch(rej=>{
        Tips.loaded()
        console.log("失败",rej)
          if(rej.code == 1002){
            if(type == 1){
              my.reLaunch({url:"/pages/coupons/coupons"})
            }else{
              that.setData({
                istoast:true,
              }) 
            }
          }else{
            Tips.toast(rej.message||'网络异常')
          }
      })
    },
    fail: (r) => {
      console.log('fail',r)
      Tips.toast("网络异常","fail")
    }
  });
},

//领取全部
getCardAll(user_no){
    let cards = this.data.cards
    let coupon_id = [];

    cards.forEach(function(e) {
      if (e.status == undefined) {
        coupon_id.push(e.id)
      }
    })
    console.log('id', cards, coupon_id)
    Tips.loading()
    app.auth.toGet(coupon_id, user_no)
      .then(res => { //1:领取成功
        Tips.loaded()
        console.log('领取成功', res)

        let datas = res.data.data
        datas.forEach(function(e) {
          cards.forEach(function(ine) {
            if (ine.id == e.coupon_id) {
              ine.status = e.status
            }
          })
        })

      var newCards = [];
      for(var i=0;i<cards.length;i+=3){
          newCards.push(cards.slice(i,i+3));
      }
       console.log("newcards",newCards)
        this.setData({
          allBtn: true,
          newCards:newCards
        })
        console.log('领取后的cards', cards)
      })
      .catch(rej => {
        Tips.loaded()
        console.log('领取失败', rej)
        Tips.toast(rej.message, 'fail')
      })
  },
  //多个领券
toGetAll() {
  let user_id = app.globalData.user_id;
  let user_no = this.data.user_no
  let it = this.data.it
  clearInterval(it) //清除定时器
  if(!user_id){
    return this.toMem(2)
  }
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
    let user_id = app.globalData.user_id;
    Tips.loading()
    if(is_ali_auto_phone){
      let sign = this.data.sign
      app.auth.register("", "", 2, 1, user_id,sign)
      .then(resin => {
        Tips.loaded();
        console.log('resin', resin)
        // Tips.toast("手机号获取成功")
        app.globalData.user_no = resin.data.data
        this.setData({
          istoast:false,
          // user_no:resin.data.data
        })
        this.getCardAll(resin.data.data)
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
          // Tips.toast("手机号获取成功")
          app.globalData.user_no = resin.data.data
           this.setData({
              istoast:false,
              // user_no:resin.data.data
            })
            this.getCardAll(resin.data.data)
          // console.log('resin', resin)
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
          let it2= setInterval(function(){
              n--
              that.setData({
                wait:true,
                codeWoc:n+"s后重新获取",
                it2:it2
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
 //取消
  cancel(){
    this.setData({
        istoast:false
      }) 
  },
  onLoad(o) {
    let type = o.type //活动类型
    let status = o.status //1是刷脸支付成功   2是刷卡未支付  3是刷卡支付成功
    this.setData({
      type:type,
      status:status
    })
    // 
    // let amount = app.globalData.payNum;
    // console.log("获取参数",o,amount)
    if(status == 2){
        let amount = o.amount;
        let viewamount = o.viewamount;  //卡券支付才有，在打印时候用
        let barCode = o.barCode;
        let id = o.id||"";             //卡券id
        console.log("amount",amount,barCode,id,viewamount)
        app.auth.pay(barCode ,amount,"",id)
        .then(res=>{
          console.log('支付',res)
          if(res.data.data.code=='SUCCESS'){
              app.globalData.payNum = res.data.data.totalPrice//实际支付金额
              app.globalData.orderNo = res.data.data.orderNo
              //语音播报
              my.ix.voicePlay({
                  eventId: 'ZFDZ',
                  number: amount,
                  success: (r) => { console.log('支付结果', r) },
              });
              //打印
                let arg = []    
                if(id != ""){
                    if(viewamount != amount){
                        arg.push(
                          {'cmd':'addText', 'args':['优惠金额：']},
                          {'cmd':'addText', 'args':[(viewamount-amount-0).toFixed(2)]},
                          {'cmd':'addPrintAndLineFeed', 'args':[]},
                          {'cmd':'addText', 'args':['实收金额：']},
                          {'cmd':'addText', 'args':[res.data.data.totalPrice.toFixed(2)]},
                          {'cmd':'addPrintAndLineFeed', 'args':[]},
                        )
                    }
                }
                if(res.data.data.payType == "ALIPAY"){
                    app.auth.ixPrint(res.data.data.orderNo,amount,"al",arg)
                }else{
                    app.auth.ixPrint(res.data.data.orderNo,amount,"wx",arg)
                }
                  //  倒计时
                let that = this
                let num = 15;
                let it = setInterval(function() {
                  num--;
                  console.log('nnn', num)
                  that.setData({
                    num: num,
                    it: it,
                    payStatus:2,
                    amount:amount,
                  })
                  if (num <= 0) {
                    clearInterval(it)
                    my.reLaunch({ url: '/pages/index/index' })
                  }
                }, 1000)
              }else{
                console.log('等待支付',res)
                app.globalData.recPay = amount
                let datas = JSON.stringify(res.data.data)
                Tips.toast(res.data.data.msg,"fail",function(){
                      my.redirectTo({url:'/pages/unusual/unusual?datas='+datas+'&&way=3'});
                }) 
            }
      })
      .catch(rej=>{
        console.log('失败',rej)
        Tips.toast('网络异常',"fail")
      })
    }else{
      //  倒计时
      let that = this
      let num = 15;
      let it = setInterval(function() {
        num--;
        console.log('nnn', num)
        that.setData({
          num: num,
          it: it,
          payStatus:2
        })
        if (num <= 0) {
          clearInterval(it)
          my.reLaunch({ url: '/pages/index/index' })
        }
      }, 1000)
    }
    //从缓存中获取商户信息,判断是否是开启新零售的商户
    let is_new_retail = my.getStorageSync({key: 'infos'}).data.is_new_retail
    let token = my.getStorageSync({key: 'token'}).data
    console.log("info",is_new_retail)
    if(is_new_retail){
        this.setData({
            token:token,
            isNew:true
        })
    }
   
   },
  onShow() {
    console.log("this.data.status",this.data.status)
    if(this.data.status != 2 ){
      let amount = app.globalData.payNum;
      this.setData({
        amount: amount,
      })
    }
    let user_no = app.globalData.user_no
    this.setData({
      user_no:user_no
    })
    //后去广告
    let device_no = app.globalData.device_no
    app.auth.getAdds(2,device_no)
    .then(res=>{
      console.log('获取广告',res)
      this.setData({
        adds:res.data.data
      })
    })
    .catch(rej=>{
      console.log('广告失败',rej)
    })
   //获取其他信息
    Tips.loading()
    Promise.all([app.auth.getMerCard(),app.auth.getCardInfo()])
    .then(res=>{
      Tips.loaded()
      let cards = res[0].data.data
      var newCards = [];
      for(var i=0;i<cards.length;i+=3){
          newCards.push(cards.slice(i,i+3));
      }
      // console.log('alll信息',res,newCards)
    
       this.setData({
         cards:cards ,
         newCards:newCards,
         is_ali_auto_phone:res[1].data.data.is_ali_auto_phone,
        })
    })
    .catch(rej=>{
       Tips.loaded()
        console.log('失败', rej)
        Tips.toast(rej.message||"网络异常", 'fail')
    })
  
    //监听键盘事件
    my.ix.onKeyEventChange((r) => {
      if (r.keyCode == 133) {
         let it = this.data.it
        clearInterval(it) //清除定时器
        my.reLaunch({ url: '/pages/index/index' })
      } 
    });
  },
  //返回首页
  out() {
    my.reLaunch({ url: '/pages/index/index' })
  },
  //页面卸载
  onUnload() {
    my.ix.offKeyEventChange();
    let it = this.data.it
    clearInterval(it) //清除定时器
     let it2 = this.data.it2
    clearInterval(it2) //清除定时器
  },
  onHide() {
     my.ix.offKeyEventChange();
    let it = this.data.it
    clearInterval(it) //清除定时器
     let it2 = this.data.it2
    clearInterval(it2) //清除定时器
  }
});
