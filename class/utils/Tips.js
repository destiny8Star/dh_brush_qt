export default class Tips {
  constructor() {
    this.isLoading = false;
  }
   static toast(title, type = 'none',callback) {
    my.showToast({
      content: title,
      type: type,
      duration: 2500,
      success:callback
    });
   
  }

   static alert(content,callback,title='提示') {
    my.alert({
      title:title,
      content: content,
      buttonText:'确定',
      success:callback
    })
  }


  static loading(title = '加载中') {  
    if (Tips.isLoading) {
      return;
    }
    Tips.isLoading = true;
    my.showLoading({
      content: title,
    });
  }

  static loaded() {
    if (Tips.isLoading) {
      Tips.isLoading = false;
      my.hideLoading();
    }
  }



  /**
     * 弹出确认窗口
     */
  static confirm(text, payload = {}, con = '确认', can = '取消', title = '提示') {
    return new Promise((resolve, reject) => {
        my.confirm({
          title: title,
          content: text,
          confirmButtonText: con,
          cancelButtonText: can,
          success: (res) => {
             if (res.confirm) {
                resolve(payload);
              } else if (res.cancel) {
                reject(res);
              }
          },
          fail: res => {
            reject(res);
          }
      });
    });
  }
    /**
     * 弹出输入框
     */
  static pro(text, plahol, con = '确认', can = '取消', title = '提示') {
    return new Promise((resolve, reject) => {
       my.prompt({
          title: title,
          message: text,
          placeholder: plahol,
          okButtonText: con,
          cancelButtonText: can,
          success: (result) => {
            console.log(result)
             if (result.ok) {
                resolve(result);
              } else{
                reject(result);
              }
          },
        });
    });
  }
  /**
    * 弹出确认窗口
    */
  static modal(text, title = '提示') {
    return new Promise((resolve, reject) => {
      my.showModal({
        title: title,
        content: text,
        showCancel: false,
        success: res => {
          resolve(res)
        },
        fail: res => {
          reject(res);
        }
      })
    })
  }
}

Tips.isLoading = false;