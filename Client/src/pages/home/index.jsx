import React,{ useEffect,useState } from "react";
import {Row, Col, Card, Avatar,Table} from "antd";
import * as AntIcons from '@ant-design/icons';

import { useUser } from "/src/hooks/useUser";
import { useTitle } from "/src/hooks/useTitle";
import PrintEcharts from "../../components/echart";
import { getHomeData } from "../../api/home/get";
import "./index.css";

const columns = [
  {
    key: "name",
    title: '课程',
    dataIndex: 'name'
  },
  {
    key: "todayBuy",
    title: '今日购买',
    dataIndex: 'todayBuy'
  },
  {
    key: "monthBuy",
    title: '本月购买',
    dataIndex: 'monthBuy'
  },
  {
    key: "totalBuy",
    title: '总购买',
    dataIndex: 'totalBuy'
  }
]
const countData = [
  {
    "name": "今日支付订单",
    "value": 1234,
    "icon": "CheckCircleOutlined",
    "color": "#2ec7c9"
  },
  {
    "name": "今日收藏订单",
    "value": 3421,
    "icon": "ClockCircleOutlined",
    "color": "#ffb980"
  },
  {
    "name": "今日未支付订单",
    "value": 1234,
    "icon": "CloseCircleOutlined",
    "color": "#5ab1ef"
  },
  {
    "name": "本月支付订单",
    "value": 1234,
    "icon": "CheckCircleOutlined",
    "color": "#2ec7c9"
  },
  {
    "name": "本月收藏订单",
    "value": 3421,
    "icon": "ClockCircleOutlined",
    "color": "#ffb980"
  },
  {
    "name": "本月未支付订单",
    "value": 1234,
    "icon": "CloseCircleOutlined",
    "color": "#5ab1ef"
  }
]
const Home = () => {
    const [tableData, setTableData] = useState(null);
    const [echartsData, setEchartsData] = useState({});
    const { user } = useUser();
    const { setTitle } = useTitle();
    useEffect(() => {
      setTitle("首页");
      getHomeData().then((data) =>{
          console.log("Home data:", data);
          setTableData(data.tableData);
          const keysArr = Object.keys(data.orderData.data[0] || {});
          const orderObjs = {
            xAxis: data.orderData.date,
            series: keysArr.map(key =>{
              return {
                name: key,
                type: 'line',
                data: data.orderData.data.map(item => {
                  return item[key] || 0;
                })
              }
            }),
          }
          const barObjs = {
            xAxis: data.userData.map(item => item.date),
            series: [
              {
                name: "新增用户",
                type: 'bar',
                data: data.userData.map(item => item.new)
              },
              {
                name: "活跃用户",
                type: 'bar',
                data: data.userData.map(item => item.active)
              }
            ]
          };
          const pieObjs = {
            series: [
              {
                type: 'pie',
                data: data.videoData,
              }
            ]
          };
          const echarts = {
            order: orderObjs,
            user: barObjs,
            video: pieObjs
          };
          setEchartsData(echarts);

      }).catch((error) =>{
          console.error("Error fetching home data:", error);
      });
    }, []);

    return (
        <div className="home-container">
            <Row >
                <Col span={8}>
                    <Card className="user-card" hoverable>
                        <div className="card-body">
                            <Avatar src={user?.avatar} size={80} alt="Home" />
                            <div className="user-info">
                                <p className="user-name">{user?.username}</p>
                                <p className="user-identity">User Identity</p>
                            </div>
                        </div>
                        <div className="card-footer">
                            <p>上次登录时间：<span className="login-time">2023-10-01 12:00:00</span></p>
                            <p>上次登录地点：<span className="login-location">地点</span></p>
                        </div>
                    </Card>
                    <Card hoverable style={{ marginTop: "16px" }}>
                        <Table pagination={false} dataSource={tableData} columns={columns} />
                    </Card>
                </Col>
                <Col span={16}>
                    <div className="count-container">
                        {countData.map((item) => {
                            const Icon = AntIcons[item.icon];
                            return (
                                <Card key={item.name} hoverable className="count-card">
                                    <div className="count-item">
                                        <div className="count-icon" style={{ backgroundColor: item.color,color:"#fff" }}>
                                            {Icon && <Icon />}
                                        </div>
                                        <div className="count-info">
                                            <p className="count-value">￥{item.value}</p>
                                            <p className="count-name">{item.name}</p>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                    {echartsData?.order?.series && <PrintEcharts style={{ height: "300px",width: "100%" }} data={echartsData.order} type="line" />}
                    <div className="bar-pie">
                      {echartsData?.user?.series && <PrintEcharts style={{ height: "300px",width: "50%" }} data={echartsData.user} type="bar" />}
                      {echartsData?.video?.series && <PrintEcharts style={{ height: "300px",width: "50%" }} data={echartsData.video} type="pie" />}
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default Home;
