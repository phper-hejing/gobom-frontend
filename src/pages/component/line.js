import React, { PureComponent } from 'react';
// 引入 echarts 主模块。
import * as echarts from 'echarts/lib/echarts';
// 引入折线图。
import 'echarts/lib/chart/line';
// 引入提示框组件、标题组件、工具箱组件。
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/toolbox';

export default class Line extends PureComponent {
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
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: keys,
      },
      grid: {
        left: '5%',
        right: '5%',
      },
      yAxis: {
        type: 'value',
      },
      series: data,
    });

    this.setState({
      chart: chart,
    });
  }

  setData = propsData => {
    let { keys, data } = this.getData(propsData);
    this.state.chart.setOption({
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: keys,
      },
      series: data,
    });
  };

  getData = data => {
    let date = [];
    let chartData = [];
    if (data) {
      data.map((item, index) => {
        item.map((itemVal, itemValIndex) => {
          date.push(itemVal.date);

          if (!chartData[itemValIndex]) {
            chartData[itemValIndex] = {
              type: 'line',
              name: itemVal.name,
              data: [],
            };
          }

          chartData[itemValIndex].data.push(itemVal.value);
        });
      });
    }
    return {
      keys: Array.from(new Set(date)),
      data: chartData,
    };
  };

  render() {
    return <div style={{ height: '500px' }} ref="line"></div>;
  }
}
