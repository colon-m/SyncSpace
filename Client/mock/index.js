import Mock from "mockjs";
import homeAPI from "./home";
import userAPI from "./user";
import permissionAPI from "./permission";
import projectAPI from "./project";

Mock.mock('/api/home/data', homeAPI.getStatisticalData);
Mock.mock('/api/user/list', userAPI.getUserList);
Mock.mock('/api/user/add', 'post', userAPI.createUser);
Mock.mock('/api/user/update', 'post', userAPI.updateUser);
Mock.mock('/api/user/delete', 'post', userAPI.deleteUser);
Mock.mock('/api/login', 'post', permissionAPI.getMenu);
Mock.mock('/api/project/list', projectAPI.getProjectList);