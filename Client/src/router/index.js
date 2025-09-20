import { createBrowserRouter } from "react-router";
import Main from "../pages/main";
import Home from "../pages/home";
import Mail from "../pages/mail";
import User from "../pages/user";
import PageOne from "../pages/others/pageOne";
import PageTwo from "../pages/others/pageTwo";
import Login from "../pages/login"; 
import Todo from "../pages/todo";
import Board from "../pages/board";

const routes = [
  {
    path: "/",
    Component: Main , 
    children: [
      {
        index: true,
        Component: Home 
      },
      {
        path: "home",
        Component: Home 
      },
      {
        path: "mail",
        Component: Mail
      },
      {
        path: "user",
        Component: User
      },
      {
        path: "others",
        children: [
          {
            path: "pageOne",
            Component: PageOne
          },
          {
            path: "pageTwo",
            Component: PageTwo
          }
        ]
      },
      {
        path: "todo",
        Component: Todo
      },
      {
        path: "board",
        Component: Board
      }
    ]
  },
  {
    path: "login",
    Component: Login
  }
];

export default createBrowserRouter(routes);