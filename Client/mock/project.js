import Mock from 'mockjs'

let List = [
  {
    "title": "项目1",
    "To Do": [
      {
        "id": "1",
        "name":"待办事项1",
        "details":"详情1",
        "owner":{
          "userName":"Colon",
          "avatar":"/src/assets/images/Colon.png"
        }
      }
    ],
    "In Progress":[
      {
        "id": "2",
        "name":"正在进行的事项1",
        "details":"详情1",
        "owner":{
          "userName":"admin",
          "avatar":"/src/assets/images/admin.png"
        }
      }
    ],
    "Completed":[
      {
        "id": "3",
        "name":"已完成事项1",
        "details":"详情1",
        "owner":{
          "userName":"admin",
          "avatar":"/src/assets/images/admin.png"
        }
      }
    ],
    "members":["admin","Colon"]
  }, 
  {
    "title": "项目2",
    "To Do": [
      {
        "id": "4",
        "name":"待办事项2",
        "details":"详情2",
        "owner":{
          "userName":"Colon",
          "avatar":"/src/assets/images/Colon.png"
        }
      }
    ],
    "In Progress":[],
    "Completed":[
      {
        "id": "6",
        "name":"已完成事项2",
        "details":"详情2",
        "owner":{
          "userName":"admin",
          "avatar":"/src/assets/images/admin.png"
        }
      }
    ],
    "members":["admin","Colon"]
  }, 
  {
    "title": "项目3",
    "To Do": [
      {
        "id": "7",
        "name":"待办事项3",
        "details":"详情3",
        "owner":{
          "userName":"admin",
          "avatar":"/src/assets/images/admin.png"
        }
      }
    ],
    "In Progress":[
      {
        "id": "8",
        "name":"正在进行的事项3",
        "details":"详情3",
        "owner":{
          "userName":"admin",
          "avatar":"/src/assets/images/admin.png"
        }
      }
    ],
    "Completed":[ ],
    "members":["admin"]
  }, 
]

export default {

  getProjectList:  () => {
    return {
      code: 0,
      count: List.length,
      data: List
    }
  },

}
