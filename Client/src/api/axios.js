import axios from 'axios';

class AxiosService {
    constructor() {
        this.instance = axios.create({
            baseURL: '/api',
            timeout: 10000,
        });
              
        this.instance.interceptors.request.use(
            (config) => {
                console.log('Request Interceptor:', config);
                return config;
            },
            (error) => {
                // 请求拦截器错误处理（如参数校验失败）
                console.error('请求拦截器错误:', error);
                return Promise.reject(error);
            }
        );
        this.instance.interceptors.response.use(
            (response) => {
                const res = response.data;
                if (res.code !== 0) { // 非成功状态（根据后端接口调整）
                    console.log("res:",res)
                    // 抛出错误，让业务代码捕获
                    return Promise.reject(new Error(res.msg || '请求失败'));
                }
                return res;
            },
            (error) => {
                console.error('响应拦截器错误:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login'; // 根据项目路由调整
                }
                // 500：服务器错误，提示用户
                if (error.response?.status === 500) {
                    alert('服务器内部错误，请稍后重试');
                }
                // 返回错误，让业务代码处理
                return Promise.reject(error);
            }
        );
    }

    get(url, config = {}) {
        return this.instance.get(url, config);
    }

    post(url, data, config = {}) {
        return this.instance.post(url, data, config);
    }

    put(url, data, config = {}) {
        return this.instance.put(url, data, config);
    }

    delete(url, config = {}) {
        return this.instance.delete(url, config);
    }
}

export default new AxiosService();
