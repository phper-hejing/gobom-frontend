import React, { PureComponent } from 'react';
// 引入 echarts 主模块。
import * as echarts from 'echarts/lib/echarts';
// 引入折线图。
import 'echarts/lib/chart/pie';
// 引入提示框组件、标题组件、工具箱组件。
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/toolbox';
import 'echarts/lib/component/legend';

const data = [
  { value: 335, name: '直接访问' },
  { value: 310, name: '邮件营销' },
  { value: 234, name: '联盟广告' },
  { value: 135, name: '视频广告' },
  { value: 1548, name: '搜索引擎' },
];

export default class Pie extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      chart: null,
    };
  }

  componentDidUpdate(nextProps) {
    if (
      this.state.chart &&
      JSON.stringify(this.props.data) != JSON.stringify(nextProps.data)
    ) {
      this.setData(this.props.data);
    }
  }

  componentDidMount() {
    let chart = echarts.init(this.refs.line);
    let { keys, data } = this.getData(this.props.data);
    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 10,
        data: keys,
      },
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '30',
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: data,
        },
      ],
    });

    this.setState({
      chart: chart,
    });
  }

  getData = data => {
    let keys = [];
    for (let index in data) {
      keys.push(data[index].name);
    }
    return {
      keys: keys,
      data: data,
    };
  };

  setData = propsData => {
    let { keys, data } = this.getData(propsData);
    this.state.chart.setOption({
      legend: {
        data: keys,
      },
      series: [
        {
          data: data,
        },
      ],
    });
  };

  render() {
    return <div style={{ height: '500px' }} ref="line"></div>;
  }
}
