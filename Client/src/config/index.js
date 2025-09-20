
const sideBarItems = [
  {
    name: '/home',
    icon: "HomeOutlined",
    label: '首页',
    url: '/home',
  },
  {
    name: '/user',
    icon: "UserOutlined",
    label: '用户管理',
    url: '/user',
  },
  {
    name: '/mail',
    icon: "ShopOutlined",
    label: '商品管理',
    url: '/mail',
  },
  {
    name: '/others',
    icon: "ShopOutlined",
    label: '其他',
    children: [
      {
        name: '/pageOne',
        icon: "InfoCircleOutlined",
        label: '关于我们',
        url: '/others/pageOne',
      },
      {
        name: '/pageTwo',
        icon: "PhoneOutlined",
        label: '联系我们',
        url: '/others/pageTwo',
      },
    ],
  },
  {
    name: '/todo',
    icon: "CheckCircleOutlined",
    label: '待办事项',
    url: '/todo',
  },
  {
    name: '/board',
    icon: "FormatPainterOutlined",
    label: '白板',
    url: '/board',
  },
];

export {
  sideBarItems,
};
