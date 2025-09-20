import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

const axisOption = {
  // 图例文字颜色
  textStyle: {
    color: "#333",
  },
  // 提示框
  tooltip: {
    trigger: "axis",
  },
  xAxis: {
    type: "category", // 类目轴
    data: [],
    axisLine: {
      lineStyle: {
        color: "#17b3a3",
      },
    },
    axisLabel: {
      interval: 0,
      color: "#333",
    },
  },
  yAxis: [
    {
      type: "value",
      axisLine: {
        lineStyle: {
          color: "#17b3a3",
        },
      },
    },
  ],
  color: ["#2ec7c9", "#b6a2de", "#5ab1ef", "#ffb980", "#d87a80", "#8d98b3"],
  series: [],
}

const normalOption = {
  tooltip: {
    trigger: "item",
  },
  color: [
    "#0f78f4",
    "#dd536b",
    "#9462e5",
    "#a6a6a6",
    "#e1bb22",
    "#39c362",
    "#3ed1cf",
  ],
  series: [],
}

const PrintEcharts = ({style,data,type}) => {
    const ChartRef = useRef(null);

    useEffect(() => {
        let option = {};
        const myChart = echarts.init(ChartRef.current);
        if(type === 'line' || type === 'bar'){
            axisOption.xAxis.data = data.xAxis;
            axisOption.series = data.series;
            option = axisOption
        }else if(type === 'pie'){
            normalOption.series = data.series;
            option = normalOption
        }
        myChart.setOption(option)
    },[data.series])
    return (
        <div ref={ChartRef} style={style} />
    )
}

export default PrintEcharts;