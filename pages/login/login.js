const app = getApp()
import Tips from '../../class/utils/Tips'
Page({
  data: {
    canlog:false,//登录按钮是否可以点击
    name:'',
    pass:'',
    status:'0',//1，已经登录，0、未登录
    infos:{}, //商户信息
  },
  /**
   * 
   * @param {登录提交} 
   */
    onSubmit(e) {
      console.log('eee',e)
      let data={
        username:e.detail.value.name,
        pwd:e.detail.value.pass
      }
      Tips.loading()
      app.auth.login(data)
      .then(res=>{
        // console.log('登录结果',res)
        my.setStorageSync({
          key: 'token', // 缓存数据的key
          data: res.data.data, // 要缓存的数据
        });
        my.setStorageSync({
          key:'user',
          data:data.username
        });
        // console.log("登录之后")//获取商户信息
        return app.auth.getMinfo()
      }) 
      .then(res=>{
          Tips.loaded()
          console.log("登录之后获取商户信息",res)
          let infos = res.data.data
          my.setStorageSync({
            key: 'infos', // 缓存数据的key
            data: infos, // 要缓存的数据
          });
          Tips.toast('登录成功',"success",function(){
              my.reLaunch({
                url:'/pages/index/index'
              })
          })
   
      })
   
      .catch(rej=>{
          Tips.loaded()
        console.log("失败",rej)
        Tips.toast(rej.message||rej.errorMessage,"fail")
      })
  },
  inpName(e){
     let pass=this.data.pass
     this.setData({
        name:e.detail.value
     })
     if(e.detail.value&&pass){
       this.setData({
        canlog:true 
       })
     }else{
         this.setData({
          canlog:false 
       })
     }
  },
   inpPass(e){
     let name=this.data.name
     this.setData({
        pass:e.detail.value
     })
    if(e.detail.value&&name){
       this.setData({
        canlog:true 
       })
     }else{
         this.setData({
          canlog:false 
       })
     }
    //  console.log('密码',e.detail.value,name)
  },
  onLoad() {

  },
  onShow(){
    let token=my.getStorageSync({
      key: 'token', // 缓存数据的key
    });
    if(token.data){
      Tips.loading()
      app.auth.getMinfo()
      .then(res=>{
        Tips.loaded()
        this.setData({
          status:'1',
          infos:res.data.data
        })
        // console.log('获取信息',res)
      })
      .catch(rej=>{
        Tips.loaded()
        Tips.toast(rej.message||rej.errorMessage)
      })
    }
  },
  /**
   * 退出登录
   */
  outLogin(){
    // my.removeStorageSync({
    //   key: 'token', // 缓存数据的key
    // });
    let that = this
    // my.clearStorage();
    my.clearStorage({
      key: 'token',
      success: function(){
        Tips.toast('成功退出','success',function(){
          that.setData({
            status:0,
            infos:{}
          })
        })
      }
    });
  }
});
