const app = getApp()
import Tips from '../../class/utils/Tips'
Page({
  data: {
    amount: '', //支付金额
    mobile: '', //会员手机号
    user_no: '',//会员卡号
    money: '',//会员余额
    num: 15, //倒计时
    list: [], //会员活动
    cards: [], //卡券数组
    newCards:[],//展示的
    allBtn: false,//一件领取按钮点击后改变
    type:0, //活动类型  1：大转盘，2：刮刮卡 0 无
    activies:[
    {
      title:'转转乐',
      cont:'支付后抽好礼',
      btn:'去抽奖',
      image:'../../imgs/v_az2.png'
    },{
      title:'刮刮乐',
      cont:'支付后刮好礼',
      btn:'去刮奖',
      image:'../../imgs/v_ag2.png'
    }],
    it: function() { }
  },
   //去h5活动
  toH5(){
    my.reLaunch({url:'/pages/activyH5/activyH5?type=1&actype='+this.data.type})
  },
  //去卡券页
toCardPage(){
   let allBtn = this.data.allBtn
    if(allBtn){
      return 
    }
    return my.reLaunch({url:"/pages/coupons/coupons"})
},

//领取全部
toGetAll(){
    let user_no = this.data.user_no
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
        this.setData({
          allBtn: true,
          newCards:newCards
        })
        console.log('领取后的cards', cards,newCards)
      })
      .catch(rej => {
        Tips.loaded()
        console.log('领取失败', rej)
        Tips.toast(rej.message, 'fail')
      })
  },
  //返回首页
  out() {
    my.reLaunch({ url: '/pages/index/index' })
  },
  onLoad(o) {
    let list = JSON.parse(o.list)
    this.setData({
      list: list
    })
    console.log('list', list)
  },
  onShow() {
    let amount = app.globalData.payNum;
    let orderNo =  app.globalData.orderNo
    let user_id =  app.globalData.user_id
    this.setData({
      amount: amount,
    })
    //语音播报
    my.ix.voicePlay({
      eventId: 'ZFDZ',
      number: amount,
      success: (r) => { console.log('支付结果', r) },
    });
    Tips.loading()
    Promise.all([app.auth.getMer("",  "",  1, user_id),app.auth.getMerCard(),app.auth.getActivy(orderNo)])
    .then(res=>{
      Tips.loaded()
      console.log('alll信息',res)
      let cards = res[1].data.data
      var newCards = [];
      for(var i=0;i<cards.length;i+=3){
          newCards.push(cards.slice(i,i+3));
      }
       this.setData({
          user_no: res[0].data.data.user_no,
          money: res[0].data.data.money,
          cards: cards,
          newCards:newCards,
          type:res[2].data.data.marketing_activy_type
        })
    })
    .catch(rej => {
        Tips.loaded()
        console.log('失败', rej)
        Tips.toast(rej.message, 'fail')
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
    //监听键盘事件
    my.ix.onKeyEventChange((r) => {
      if (r.keyCode == 133) {
        clearInterval(it) //清除定时器
        my.reLaunch({ url: '/pages/index/index' })
      } else {
        // console.log('其他键盘113 /57')
      }

    });
  },
  //页面卸载
  onUnload() {
    console.log("卸载")
     my.ix.offKeyEventChange();
    let it = this.data.it
    clearInterval(it) //清除定时器
     let it2 = this.data.it2
    clearInterval(it2) //清除定时器
  },
  onHide() {
    console.log("隐藏")
    my.ix.offKeyEventChange();
    let it = this.data.it
    clearInterval(it) //清除定时器
     let it2 = this.data.it2
    clearInterval(it2) //清除定时器
  }
});
