const app = getApp()
import Tips from '../../class/utils/Tips'
const QRCode = require('qrcode');//引入qrcode插件
Page({
  data: {
    imgSrc: "",//二维码图片
    merName:"商户名",
  },
  onLoad() {
     let infos = my.getStorageSync({ key: 'infos' }).data;
     this.setData({
        merName:infos.shop_name
     })
    let self = this;
    Tips.loading()
    app.auth.getMerCode()
    .then(res=>{
      Tips.loaded()
      console.log("获取 ",res)
     //根据字符串生成svn格式的二维码 
      QRCode.toString(res.data.data, { type: 'svg' }, function (err, url) {
        let str = 'data:image/svg+xml;base64,' + Buffer(url).toString('base64');
        // console.log("图片",str)
        self.setData({
          imgSrc: str
        })
      });
    })
    .catch(rej=>{
      Tips.loaded()
      Tips.toast(rej.message||"网络异常")
      // console.log("获取失败",rej)
    })
   

  },



  
});
