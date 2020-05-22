import Tips from './Tips.js';

// const baseURL ='http://2k256y6514.51mypc.cn'
// const baseURL = 'https://l-j-y17698644696.eicp.vip'

export default class Http {
  constructor() {
  }
  /**
   * 
   */
  static request(method, url, data) {
    return new Promise((resolve, reject) => {

      let header = this.createAuthHeader();
      if (!data) {
        data = {};
      }
      // if (method.toUpperCase() == 'POST') {
      //   header = Object.assign(header, {
      //     'content-type': 'application/x-www-form-urlencoded'
      //   });
      // }

      /**测试用
       */
      //  header["mer-auth"] ='eyJleHBpcmVzIjoxNTcxODE4ODk3LCJyb2xlX2lkIjo0LCJzaWduIjoiMGJhYjE1MGI0NTE5YjIzNDlhMmVhZmQ0YjYwNzE1N2Q3NTE3NTQ5ZTQwNjJhMzY2NzgyMzAyM2IzOTc0MTBlNCIsInVzZXJfaWQiOjV9' ;
      my.request({
        url: url,
        method: method,
        headers: header,
        data: data,
        success: (res) => {
          // console.log("总请求结果",res)
          const Code = res.status;
          if (Code != 200) {
            reject(res)
          } else {
            const alData = res.data;
            const code = alData.code;
            if (code != 200) {
              if (code == 200302) { //重新授权的提示
                console.log('登录过期')
                return Tips.toast('登录失效，请重新登录', 'fail', function() {
                  my.removeStorage({
                    key: 'token',
                    success: () => {
                      my.reLaunch({
                        url: '/pages/tips/tips',
                      })
                    }
                  });
                })
              }
              reject(alData);
            }
            // console.log(res.headers.Date)
            if(res.headers['refresh-auth']){
                my.setStorageSync({
                  key: 'token', // 缓存数据的key
                  data: res.headers['refresh-auth'], // 要缓存的数据
                });
            }
            resolve(res);
          }
        },
        fail: (res) => {
          reject(res);
        }
      })
    });
  }

  static createAuthHeader() {
    var header = {};
    let token = my.getStorageSync({ key: 'token' })
    if (token.data && token.data != '') {
      header["mer-auth"] = my.getStorageSync({ key: 'token' }).data;
    }
    return header;
  }


  static get(url, data) {
    return this.request("GET", url, data);
  }
  static post(url, data) {
    return this.request("POST", url, data);
  }

}