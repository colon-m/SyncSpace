import request from '../axios';

export const getHomeData = async () => {
    const response = await request.get('/home/data');
    if (response.code !== 0) {
        throw new Error(response.msg || '请求失败');
    }
    return response.data;
};
