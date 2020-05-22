const app = getApp()
import Tips from '../../class/utils/Tips'
Page({
  data: {
    isTs:1,//是否是提审状态  1是 0否
    isNew:false,//是否是新零售商户
    token:"",// token 小程序二维码图片用
    apiHost:app.auth.baseURL3,//域名
    adds: [],//广告数组
    toH5: false,//广告是否可以去h5
    infos: {}, //弹框内容
    img: '',//首页第一张图
    tsimg:'',//首页第一张图--提审展示
    card_status: 0, //0 是禁用 1是启用
    coupon_status:0, //卡券支付入口状态: 0禁用 1启用
    index_logo:app.auth.index_logo,//底部logo
    industrys:[
      {
        id:0,
        name:"药店",
        url:"/goods"
      },
      {
        id:1,
        name:"加油站",
        url:"/#/gas"
      },
      {
        id:2,
        name:"医院",
        url:"/#/industry/hospital"
      },
      {
        id:3,
        name:"门票",
        url:"/#/industry/paradiseTicketing"
      },
    ],//行业
  },
  // 展示成功回调 
  onDisplaySuccess() {
    console.log('poster display success');
  },
  // 展示失败回调 
  onDisplayFail(e) {
    console.log('poster display fail, error = ' + e.detail.error);
  },
  onLoad(query) {
    // 页面加载  获取序列号
    let device_no = app.globalData.device_no
    // console.log("设备序列号:SMIT3B2019928000579",device_no)
    app.auth.getAdds(1,device_no)
    .then(res=>{
      console.log('获取广告',res)
      this.setData({
        adds:res.data.data
      })
    })
    .catch(rej=>{
      console.log('广告失败',rej)
    })
    //是否是提审状态
    app.auth.getTsStatus(device_no)
    .then(res=>{
      console.log('获取提审',res)
      this.setData({
        isTs:res.data.data
      })
    })
    .catch(rej=>{
      console.log('广告失败22',rej)
    })
    //首页统配广告&&提审图片
    let year = String(new Date().getFullYear()) 
    let month = String(new Date().getMonth()+1)
    let day = String(new Date().getDate())
    let hours = new Date().getHours()
    let ts = year+month+day+hours
    let index_img = app.auth.index_img
    let index_tsimg = app.auth.index_tsimg
    this.setData({
      img:index_img+"?t="+ts,
      tsimg:index_tsimg+"?t="+ts
    })
     //从缓存中获取商户信息,判断是否是开启新零售的商户
    let is_new_retail = my.getStorageSync({key: 'infos'}).data.is_new_retail
    console.log("info",is_new_retail)
    if(is_new_retail){
        this.setData({
            isNew:true
        })
    }
    //如果登录名称是这个，就可以去h5
    let user = my.getStorageSync({key:'user'}).data
    if(user =='admin123'){
       this.setData({
         toH5:true
       })
    }
  },
  //去其他h5页面
  toOtherh5(e){
    let type = e.target.dataset.type
    let url = e.target.dataset.url
    console.log("e",e,type,url)
    my.navigateTo({url:"/pages/otherH5/otherH5?type="+type+"&url="+url})
  },

  toHy() {
    // console.log('版本', my.ix.getVersionSync().versionCode)
    app.auth.ixPrint("xw524564654",300,"vip")
    
      //轻会员
      // my.navigateToMiniService({
      //   serviceId: "2019072365974237", // 插件id,固定值勿改
      //   servicePage: "pages/hz-enjoy/main/index", // 插件页面地址,固定值勿改
      //   extraData: {
      //     "alipay.huabei.hz-enjoy.templateId": "2019101500020903070000814851",
      //     "alipay.huabei.hz-enjoy.partnerId": "2088531847065070",
      //   },
      //   success: (res) => { 
      //     console.log('轻会员成功',res)
      //   },
      //   fail: (res) => {
      //     console.log('轻会员fail',res)
      //    },
      //   complete: (res) => { },
      // });

  },
  toConfig() {
    my.navigateTo({
      url: '/pages/settings/settings'
    })
  },
  //获取卡券信息 
  getcardInfo(order){
   app.auth.getActivy(order)
      .then(res => {
        let datas = res.data.data
        console.log('获取推荐的卡券', res,datas)
        if(datas.have_coupon || datas.have_marketing_activy){
          my.reLaunch({url:'/pages/verify/verify?type='+datas.marketing_activy_type+"&status=1"});//1是刷脸支付成功
        }
      })
      .catch(rej => {
        console.log('卡券失败', rej)
        Tips.toast(rej.message, 'fail')
      })
  },
  //支付
  toPay(amount){
      let bizNo=new Date().getTime()
      my.ix.startApp({
        appName: 'cashier',
        bizNo: bizNo,
        showScanPayResult:true,
        totalAmount: amount,
        orderDetail: [],
        success: (r) => {
          console.log('收银台返回扫脸码',r);
          if(r.codeType == 'C'){
             //监听刷卡的 
             // this.resCard(bizNo,amount)废弃
             my.reLaunch({url:'/pages/verify/verify?status=2&amount='+amount+"&barCode="+r.barCode});//2是刷卡未支付
                    
          }else{
              app.auth.pay(r.barCode ,amount)
              .then(res=>{
              console.log('支付',res)
                if(res.data.data.code=='SUCCESS'){
                    app.globalData.payNum = res.data.data.totalPrice//实际支付金额
                    app.globalData.orderNo = res.data.data.orderNo
                    //打印
                    if(res.data.data.payType == "ALIPAY"){
                        app.auth.ixPrint(res.data.data.orderNo,amount,"al")
                    }else{
                        app.auth.ixPrint(res.data.data.orderNo,amount,"wx")
                    }
                    
                    this.getcardInfo(res.data.data.orderNo)
                      
                    }else{
                      console.log('支付失败',res)
                      Tips.toast(res.data.data.message||"网络异常","fail")
                  }
            })
            .catch(rej=>{
              console.log('失败',rej)
              Tips.toast('网络异常',"fail")
            })
          }
        },
        fail:(r)=>{
          console.log("api失败",r)
          if(r.errorMessage == "null(Z1008)"){
            Tips.toast('支付取消','exception')
          }else{
            Tips.toast(r.errorMessage,"exception")
          }
        }
      });
  },
  resCard(bizNo,amount){//废弃
    console.log('刷卡结果')
    my.ix.startApp({
        appName: 'scanPayResult',
        bizNo: bizNo,
        totalAmount: amount,
    });    
  },

  //去核身会员
  toMem(){
    my.ix.faceVerify({
      option: 'life',
      success: (r) => {
        let open_id = r.buyerId
        console.log('核身success',r,open_id)
        app.auth.getMer("",  "",  1, open_id)  //mobile,orderNo,user_tag,open_id,type
        .then(res=>{
          console.log("获取会员信息",res)
            app.globalData.user_id = open_id
            app.globalData.user_no = res.data.data.user_no
            // app.globalData.mobile = res.data.data.mobile
           my.navigateTo({ url: '/pages/facemem/facemem' })
        })
        .catch(rej=>{
          console.log("失败",rej)
           if(rej.code == 1002){
              app.globalData.user_id = open_id
              my.navigateTo({url:"/pages/register/register"})
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
  onReady() {
    // 页面加载完成
  },
  onShow() {
    console.log("this.data.isNew",this.data.isNew)
    //来到这个页面，先清除所有全局的属性
    app.globalData.payNum = 0   //支付金额
    app.globalData.recNum = 0  //充值金额
    app.globalData.user_no = ''; //会员号
    app.globalData.mobile = ''; //会员手机号
    app.globalData.orderNo = ''; //充值订单号 或者支付订单号
    app.globalData.user_id = ""; //刷脸获取
    let token = my.getStorageSync({ key: 'token', });// 缓存数据的key
    if (!token.data) {
      return my.navigateTo({ url: '/pages/tips/tips' })
    }
    this.setData({
      token:token.data
    })
    //获取会员卡信息
    app.auth.getConf()
      .then(res => {
        console.log('获取开卡信息', res)
        this.setData({
          card_status: res.data.data.card_status,
          coupon_status: res.data.data.counpon_status
        })
      })
      .catch(rej => {
        console.log('失败', rej)
        return Tips.toast(rej.message, 'fail')
      })

    // # 开始接收指令
    my.ix.startMonitorTinyCommand({
      success: (r) => {
        console.log("开始接收指令成功",r);
      },
      fail: (r) => {
        console.log("fail, errorCode:" + r.error);
      }
    });
    
    // // # 等待指令的接收
    my.ix.onMonitorTinyCommand((r) => {
      console.log("received data:", r);
      let card_status = this.data.card_status //获取会员卡状态
      let coupon_status = this.data.coupon_status //获取卡券状态
      let mon = r.totalAmount
      app.globalData.payNum = mon
      my.navigateTo({ url: '/pages/member/member?coupon_status='+coupon_status+'&&card_status='+card_status });
      
    });  
    // 键盘监听
    my.ix.onKeyEventChange((r) => {
      console.log("监盘",r)
      //如果是设置，就直接进去
      if (r.keyCode == 134) {
        return this.toConfig()
      }
      //过期判断
      Tips.loading()
      app.auth.isOverdue()
        .then(res => {
          Tips.loaded()

          console.log('成功', res)
          if (r.keyCode == 131) {
            // console.log('收款')
            let card_status = this.data.card_status //获取会员卡状态
            let coupon_status = this.data.coupon_status //获取卡券状态
            let mon = r.amount
            let reg = /\./
            if (reg.test(mon)) {
              mon = mon.slice(0, mon.indexOf('.') + 3)
            }
            if (mon == 0) {
              return Tips.toast('请输入正确金额', 'fail')
            }
            app.globalData.payNum = mon

            if (card_status || coupon_status ) {
                my.navigateTo({ url: '/pages/member/member?coupon_status='+coupon_status+'&&card_status='+card_status });
            }else if(this.data.isNew){//如果开通新零售商户
                my.navigateTo({ url: '/pages/member/member?coupon_status='+coupon_status+'&&card_status='+card_status });
            }else {
              // my.navigateTo({ url: '/pages/samount/samount?coupon_status='+coupon_status });
             this.toPay(mon)
            }

          } else if (r.keyCode == 132) {
            console.log('刷脸!!')
            let card_status = this.data.card_status //获取会员卡状态
            if (card_status) {
              // my.navigateTo({ url: '/pages/memcheck/memcheck?type=f' })
              this.toMem()
            }
          } else {
            // console.log('其他键盘113 /57')
          }
        })
        .catch(rej => {
          Tips.loaded()
          //登录异常
          console.log(rej)
          Tips.toast(rej.message, 'fail')
        })

    });
  },
  onHide() {
    // 页面隐藏
    my.ix.offKeyEventChange();
    // # 结束接收指令
    my.ix.offMonitorTinyCommand({
      success: (r) => {
        console.log("接收指令结束",r);
      },
      fail: (r) => {
        console.log("fail, errorCode:" + r.error);
      }
    });
   
  },
  onUnload() {
    // 页面被关闭
    my.ix.offKeyEventChange();
  },
});
