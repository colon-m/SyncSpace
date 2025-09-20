import AxiosRequst from "../axios";

export const login = async (data) => {
    const response = await AxiosRequst.post("/login",data);
    if (response.code !== 0) {
        return new Error(response.data.msg);
    }else{
        return response.data;
    }

}