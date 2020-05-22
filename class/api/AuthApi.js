import BaseApi from './BaseApi.js';
import { hex_md5 } from '../utils/md5.js';
import config from '../config/Index';

const baseURL3 = config.baseURL3;  //商户相关
const baseURL2 = config.baseURL2;    //支付相关
const pay_key = config.pay_key;  //线上
const h5_activy = config.h5_activy;//h5活动
const h5_pay = config.h5_pay;//h5广告支付-药店
const index_logo = config.index_logo //首页底部logo
const index_img = config.index_img  //首页图片
const index_tsimg = config.index_tsimg  //首页图片--提审用

export default class AuthApi extends BaseApi {
  constructor() {
    super();
    this.h5_activy = h5_activy
    this.h5_pay = h5_pay
    this.index_logo = index_logo
    this.index_img = index_img
    this.index_tsimg = index_tsimg
    this.baseURL3 = baseURL3
  }

  /**
   * 登录
   * */
  login(data) {
    return this.post(baseURL3 + '/public/user/login', data)
  }
  /**
   *判断是否过期
   */

  isOverdue() {
    return this.get(baseURL3 + '/mer/applet/user/check/login')
  }
  /*
    获取商户信息
  */
  getMinfo() {
    return this.post(baseURL3 + '/mer/applet/user/info')
  }
  /**
   * 付款接口
   */
  pay(authcode, price, user_no = '', couponId = '') {
    let sign = '';
    let times = new Date().getTime()
    sign += 'authCode=' + authcode + '&timestamp=' + times + '&totalPrice=' + price + '&key=' + pay_key
    sign = hex_md5(sign).toUpperCase()
    // console.log('参数',authcode,sign,price,user_no,couponId)
    return this.post(baseURL2 + '/api/aliFacePay/createFaceOrder', {
      "authCode": authcode,
      "sign": sign,
      "timestamp": times,
      "totalPrice": price,
      "userNo": user_no,
      "couponId": couponId
    })
  }
  /**
   * 查询支付结果
   * */
  getPayres(orderNo) {
    return this.post(baseURL2 + '/api/aliFacePay/facePayOrderQuery', {
      orderNo: orderNo
    })
  }
  /**
   * @param {商户是否开启会员卡} mobile 
   */
  getConf() {
    return this.post(baseURL3 + '/mer/applet/vipCard/getConf')
  }

  /**
   * 获取会员信息
   */
  getMer(mobile, orderNo = '', user_tag = 1, open_id = "", type = 1) { //商家用户类型 1:会员 2:普通用户 默认为1   用户openId授权类型 :1 支付宝，2 微信 仅传openId时传
    // console.log("请求参数",mobile,orderNo,user_tag,open_id,type)
    return this.post(baseURL3 + '/mer/applet/terminal/user/getInfo', {
      mobile: mobile,
      order_no: orderNo,
      user_tag: user_tag,
      open_id: open_id,
      type: type,
    })
  }
  /**
   * 获取会员卡信息--开卡用
   */
  getCardInfo() {
    return this.post(baseURL3 + "/mer/applet/vipCard/activyInfo")
  }
  /**
   * 获取验证码
   */
  getCode(mobile) {
    return this.post(baseURL3 + '/mer/applet/terminal/user/sendCode', {
      mobile: mobile
    })
  }
  /**
   * 授权获取加密手机信息-解密
   */
  getPhone(ali_sign_content) {
    return this.post(baseURL3 + '/mer/applet/terminal/user/decryptContent', {
      ali_sign_content: ali_sign_content
    })
  }
  /**
   * 终端注册会员
   */
  register(code, mobile, user_tag = 1, type = 1, open_id = "", ali_sign_content = "") { //user_tag注册类型 1:会员 2:普通用户 默认为1  type:1默认设备蜻蜓  2:青蛙
    // console.log('注册传参', code, mobile, user_tag,type = 1,open_id,ali_sign_content)
    return this.post(baseURL3 + '/mer/applet/terminal/user/register', {
      code: code,
      mobile: mobile,
      user_tag: user_tag,
      type: type,
      open_id: open_id,
      ali_sign_content: ali_sign_content
    })
  }
  /**
   * 会员付款接口
   */
  merpay(price, user_no, couponId = '') {
    let sign = '';
    let times = new Date().getTime()
    sign += 'userNo=' + user_no + '&timestamp=' + times + '&totalPrice=' + price + '&key=' + pay_key
    sign = hex_md5(sign).toUpperCase()
    console.log('参数', user_no)
    return this.post(baseURL2 + '/api/vipCardPay/createVipCardPayOrder', {
      "sign": sign,
      "timestamp": times,
      "totalPrice": price,
      "userNo": user_no,
      "couponId": couponId
    })
  }

  /**
   * 核身查询卡券
   */
  //非会员
  getCard(user_no, amount) {
    return this.post(baseURL3 + '/mer/applet/coupon/getMerCouponByTerminalUserTel', {
      user_no: user_no,
      total_price: amount
    })
  }
  //会员
  getmCard(user_no, amount) {
    return this.post(baseURL3 + '/mer/applet/coupon/getVipMerCouponByTerminalUserTel', {
      user_no: user_no,
      total_price: amount
    })
  }

  /**
   * 获取推荐商家卡券
   */
  getMerCard() {
    return this.post(baseURL3 + '/mer/applet/coupon/pullCoupon')
  }

  /**
   * 用户领取卡券
   */
  toGet(coupon_id, user_no) {
    return this.post(baseURL3 + '/mer/applet/coupon/user/getCoupon', {
      coupon_id: coupon_id,
      user_no: user_no
    })
  }
  /**
   * 获取商家营销活动状态 刮刮乐
   */
  getActivy(order_no) {
    return this.post(baseURL3 + '/mer/applet/coupon/status', {
      order_no: order_no
    })
  }
  /**
   * 获取广告
   */
  getAdds(ad_type, device_no) {
    return this.post(baseURL3 + '/agent/Advertising/ad/list', {
      ad_type: ad_type,// 1 支付前海报，2 支付后海报
      device_no: device_no
    })
  }
  /**
   * 点击曝光
   */
  doExposure(ad_id, device_no) {
    return this.post(baseURL3 + '/agent/Advertising/ad/h5/isRedirect', {
      ad_id: ad_id,
      device_no: device_no
    })
  }
  /**
   * 格式化时间
   *  */
  dateFormat(fmt, date) {
    let ret;
    let opt = {
      "Y+": date.getFullYear().toString(),        // 年
      "m+": (date.getMonth() + 1).toString(),     // 月
      "d+": date.getDate().toString(),            // 日
      "H+": date.getHours().toString(),           // 时
      "M+": date.getMinutes().toString(),         // 分
      "S+": date.getSeconds().toString()          // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
      ret = new RegExp("(" + k + ")").exec(fmt);
      if (ret) {
        fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
      };
    };
    return fmt;
  }
  /**
   * 打印机打印
   */
  ixPrint(orderNo, amount, type, arg = []) {
    let infos = my.getStorageSync({ key: 'infos' }).data;
    let date = new Date()
    let times = this.dateFormat("YYYY-mm-dd HH:MM:SS", date)
    // console.log("times",this,times)
    amount = Number(amount).toFixed(2)
    let base = [{ 'cmd': 'addSelectPrintModes', 'args': ['FONTA', 'OFF', 'OFF', 'OFF', 'OFF'] },
    { 'cmd': 'addSetLineSpacing', 'args': ['80'] },
    { 'cmd': 'addSelectJustification', 'args': ['CENTER'] },
    { 'cmd': 'addText', 'args': [infos.shop_name] },
    { 'cmd': 'addPrintAndLineFeed', 'args': [] },
    { 'cmd': 'addText', 'args': ['-·-·-·-·-·-·-·-·-·-·-'] },
    { 'cmd': 'addPrintAndLineFeed', 'args': [] },
    { 'cmd': 'addSelectPrintModes', 'args': ['FONTA', 'OFF', 'OFF', 'OFF', 'OFF'] },
    { 'cmd': 'addSelectJustification', 'args': ['LEFT'] },
    { 'cmd': 'addText', 'args': ['收银员：'] },
    { 'cmd': 'addText', 'args': [infos.mer_name] },
    { 'cmd': 'addPrintAndLineFeed', 'args': [] },
    { 'cmd': 'addText', 'args': ['交易单号：'] },
    { 'cmd': 'addText', 'args': [orderNo] },
    { 'cmd': 'addPrintAndLineFeed', 'args': [] },
    { 'cmd': 'addText', 'args': ['交易时间：'] },
    { 'cmd': 'addText', 'args': [times] },
    { 'cmd': 'addPrintAndLineFeed', 'args': [] },
    { 'cmd': 'addText', 'args': ['交易金额：'] },
    { 'cmd': 'addText', 'args': [amount] },
    { 'cmd': 'addPrintAndLineFeed', 'args': [] },
    ]
    let wx = "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"
    let al = "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"
    let argLogo = []
    if (type != "vip") {
      console.log("type", type)
      let logo
      type == "al" ? logo = al : logo = wx
      argLogo = [
        { 'cmd': 'addPrintAndFeedLines', 'args': ['1'] },
        { 'cmd': 'addSelectJustification', 'args': ['CENTER'] },
        { 'cmd': 'addRastBitImage', 'args': [logo, '320', '0'] },
        { 'cmd': 'addPrintAndLineFeed', 'args': [] },
      ]
    }
    let argEnd = [
      { 'cmd': 'addText', 'args': ['-·-·-·-·-·-·-·-·-·-·-'] },
      { 'cmd': 'addSelectJustification', 'args': ['LEFT'] },
      { 'cmd': 'addText', 'args': ['谢谢惠顾!!!欢迎下次光临!!!'] },
      { 'cmd': 'addPrintAndLineFeed', 'args': [] },
    ]
    let args = [...base, ...arg, ...argLogo, ...argEnd]

    my.ix.queryPrinter({
      success: (r) => {
        if (r.usb.length > 0) {
          my.ix.printer({
            cmds: args,
            success: (r) => {
              console.log("打印成功", r)
            },
            fail: (r) => {
              console.log("打印失败", r)
            }
          });
        } else {
          console.log("唤起打印机失败", r)
        }
      },
      fail: (r) => {
        console.log("唤起打印机失败", r)
      }
    });
  }
/**
 * 获取商户二维码
 */
getMerCode(){
  return this.post(baseURL3+"/mer/JH/qt/QRCode")
}
/**
 * 获取小程序二维码
 */
getWeCode(){
  return this.get(baseURL3+"/mer/wx/get/qr/code")
}
/**
 * 获取是否是提审状态
 */
getTsStatus(device_no){
  return this.get(baseURL3+'/public/getQTAuditStatus?device_no='+device_no )
}

}