Page({
  data: {},
  onLoad() {},
  toConfig(){
     my.navigateTo({
       url:'/pages/settings/settings'
     })
  },
  onShow(){
    my.ix.onKeyEventChange((r) => {
        console.log('键盘',r)
    if(r.keyCode == 134){
           this.toConfig()
      }else{
        console.log('其他键盘')
      }
    });
  },
  onUnload(){
     my.ix.offKeyEventChange();

  },
   onHide() {
     my.ix.offKeyEventChange();
  }
});
