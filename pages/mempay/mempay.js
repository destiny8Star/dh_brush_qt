import Tips from '../../class/utils/Tips'
const app = getApp()
Page({
  data: {
    status: 1,   //余额充足：1；不足：2
    amount: '', //支付金额
    money: '', //会员余额
    user_no: '', //会员号 支付用
    mobile: '', //会员手机号
    smobile: '',//展示的手机号
    num: 15, //倒计时
    infos: [], //卡券信息
    hasYH: true,
    it: function() { }
  },
  //支付
  toPay(amount) {
    let bizNo = new Date().getTime()
    my.ix.startApp({
      appName: 'cashier',
      bizNo: bizNo,
      showScanPayResult: true,
      totalAmount: amount,
      orderDetail: [],
      success: (r) => {
        // console.log('收银台返回扫脸码',r);
        let user_no = this.data.user_no

        if (r.codeType == 'C') {
            my.redirectTo({ url: '/pages/recharge/recharge?status=2&barCode='+r.barCode+'&amount='+amount+'&user_no='+user_no });//status=2刷卡未支付
        } else {
          app.auth.pay(r.barCode, amount, user_no)
          .then(res => {
            console.log('支付', res)
            if (res.data.data.code == 'SUCCESS') {
               app.globalData.orderNo = res.data.data.orderNo
               //打印
                if(res.data.data.payType == "ALIPAY"){
                  app.auth.ixPrint(res.data.data.orderNo,amount,"al")
                }else{
                  app.auth.ixPrint(res.data.data.orderNo,amount,"wx")
                }
                console.log('走到成功这里')
                my.redirectTo({ url: '/pages/recharge/recharge?status=1' });//刷脸支付成功
            } else {
              console.log('等待支付', res)
              let datas = JSON.stringify(res.data.data)
              Tips.toast(res.data.data.msg, "fail", function() {
                my.redirectTo({ url: '/pages/unusual/unusual?datas=' + datas + '&&way=2' });
              })
            }
          })
          .catch(rej => {
            console.log('失败', rej)
            Tips.toast('网络异常', "fail")
          })

        }
    
      },
      fail: (r) => {
        console.log("api失败", r)
        if (r.errorMessage == "null(Z1008)") {
          Tips.toast('支付取消', 'exception')
        } else {
          Tips.toast(r.errorMessage, "exception")
        }
      }
    });
  },
  /**
   * 支付结果处理
   */
  resCard(bizNo, amount) {
    console.log('刷卡结果')
    my.ix.startApp({
      appName: 'scanPayResult',
      bizNo: bizNo,
      totalAmount: amount,
    });
  },
  //返回首页
  out() {
    my.reLaunch({ url: '/pages/index/index' })
  },
  //是否选择使用优惠券
  checkYH(e) {
    console.log('youhui', e)
    this.setData({
      hasYH: e.detail.value
    })
  },
  //会员支付
  memPay() {
    // let hasYH = this.data.hasYH
    // console.log('hase',hasYH)
    let user_no = this.data.user_no
    let amount = this.data.amount
    let hasYH = this.data.hasYH; //是否选择使用优惠券
    let infos = this.data.infos;

    let id = '' //要传递的id
    if (infos.length > 0 && hasYH) {
      id = infos[0].id
    } 
    Tips.loading()
    app.auth.merpay(amount, user_no, id)
      .then(res => {
        Tips.loaded()
        console.log('会员支付结果', res)
        if (res.data.data.code == 'SUCCESS') {
          let list = JSON.stringify(res.data.data.list)
          app.globalData.orderNo = res.data.data.orderNo
          let arg = []
          let arrs = res.data.data.list
          if (arrs.length>0){
              let discount = 0
              for(let i=0;i<arrs.length;i++){
                let num = Number(arrs[i].value)
                if(num<0){
                    discount+=num
                }
              }
            //  console.log("计算",discount,amount-0,amount+discount)
             
              arg.push(
                {'cmd':'addText', 'args':['优惠金额：']},
                {'cmd':'addText', 'args':[discount.toFixed(2)]},
                {'cmd':'addPrintAndLineFeed', 'args':[]},
                {'cmd':'addText', 'args':['实收金额：']},
                {'cmd':'addText', 'args':[(amount-0+discount).toFixed(2)]},
                {'cmd':'addPrintAndLineFeed', 'args':[]},
              )
          }
          //打印
          app.auth.ixPrint(res.data.data.orderNo,amount,"vip",arg)

          my.reLaunch({ url: '/pages/payres/payres?list=' + list });
        } else {
          Tips.toast(res.data.data.msg, 'fail')
        }
      })
      .catch(rej => {
        Tips.loaded()
        Tips.toast(rej.message, 'fail')
        console.log('支付失败', rej)
      })
  },
  onLoad(o) {
  },
  onShow() {
    let amount = app.globalData.payNum;
    let user_id =  app.globalData.user_id
    let user_no = app.globalData.user_no
    console.log("userid",user_id)
    // let mobile = app.globalData.mobile;
    // let s1 = mobile.slice(0, 3)
    // let s2 = mobile.slice(-4)
    // let smobile = s1 + '****' + s2
    //获取会员信息
    Tips.loading()
     app.auth.getMer("",  "",  1, user_id)
      .then(res => {
        console.log('获取信息', res, amount)
        Tips.loaded()
        if (res.data.data.money < amount) {
          this.setData({
            status: 2
          })
        } else {
          this.setData({
            status: 1
          })
        }
        this.setData({
          money: res.data.data.money,
          user_no: res.data.data.user_no,
          // mobile: mobile,
          // smobile: smobile
        })
      })
      .catch(rej => {
        Tips.loaded()
        Tips.toast(rej.message, 'fail')
      })

    //获取卡券信息
    app.auth.getmCard(user_no, amount)
      .then(res => {
        this.setData({
          infos: res.data.data
        })
        console.log('获取卡券信息', res)
      })
      .catch(rej => {
        console.log('失败', rej)
        Tips.toast(rej.message, 'fail')
      })

    this.setData({
      amount: amount
    })

    //倒计时
    let that = this
    let num = 15;
    let it = setInterval(function() {
      num--;
      console.log('nnn', num)
      that.setData({
        num: num,
        it: it
      })
      if (num <= 0) {
        clearInterval(it)
        my.reLaunch({ url: '/pages/index/index' })
      }
    }, 1000)
    // 键盘监听
    my.ix.onKeyEventChange((r) => {
      console.log('键盘', r)
      if (r.keyCode == 131) {
        let mon = r.amount
        let reg = /\./
        if (reg.test(mon)) {
          mon = mon.slice(0, mon.indexOf('.') + 3)
        }
        if (mon == 0) {
          return Tips.toast('请输入正确金额', 'fail')
        }
        let it = this.data.it
        clearInterval(it) //清除定时器

        app.globalData.recPay = mon
        this.toPay(mon)
      } else {
        // console.log('其他键盘113 /57')
      }
    });
  },
  //页面卸载
  onUnload() {
    console.log('页面卸载')
    let it = this.data.it
    clearInterval(it) //清除定时器
    // 页面隐藏
    my.ix.offKeyEventChange();
  },
  onHide() {
    console.log('页面隐藏')
    let it = this.data.it
    clearInterval(it) //清除定时器
    my.ix.offKeyEventChange();
  }
});
