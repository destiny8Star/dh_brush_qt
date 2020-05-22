import Http from '../utils/Http.js';
export default class BaseApi {
  constructor() {
    //网络请求
    this.get = Http.get.bind(Http);
    this.post = Http.post.bind(Http);
  }
}
