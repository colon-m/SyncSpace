import AxiosRequst from "../axios";

export const getUserList = async () => {
  const res = await AxiosRequst.get("/user/list")
  if(res.code !== 0) {
    return new Error(res.msg)
  }else{
    return res
  }
}

export const createUser = async (data) => {
  const res = await AxiosRequst.post("/user/add",data)
  if(res.code !== 0) {
    return new Error(res.msg)
  }else{
    return res
  }
}

export const updateUser = async (data) => {
  const res = await AxiosRequst.post("/user/update",data)
  if(res.code !== 0) {
    return new Error(res.msg)
  }else{
    return res
  }
}

export const deleteUser = async (data) => {
  const res = await AxiosRequst.post("/user/delete",data)
  if(res.code !== 0) {
    return new Error(res.msg)
  }else{
    return res
  }
}
