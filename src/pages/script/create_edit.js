import React, { Component, Fragment, PureComponent } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Radio,
  Tabs,
  Collapse,
  Badge,
  InputNumber,
  message,
  Progress,
  Popconfirm,
  Tag,
} from 'antd';
import {
  REQUEST_HTTP,
  REQUEST_TCP,
  TYPE_COMMON,
  TYPE_TRANSACTION,
} from '../../constant';
import {
  CaretDownOutlined,
  CaretRightOutlined,
  MinusCircleOutlined,
  CopyrightCircleOutlined,
  UpCircleOutlined,
  DownCircleOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { connect } from 'dva';
import { history } from 'umi';
import Kv from '../component/kv';
import Body from '../component/body';

const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const defaultSelectedMethod = 'GET';
const defaultMethods = ['GET', 'POST', 'PUT', 'DELETE'];
const customPanelStyle = {
  borderRadius: 4,
  marginBottom: 5,
  overflow: 'hidden',
};

const namespace = 'script';
const scriptModelEvent = dispatch => {
  return {
    addScript: data => {
      dispatch({
        type: `${namespace}/addScript`,
        payload: JSON.parse(JSON.stringify(data)),
      }).then(resp => {
        if (resp.msg != '') {
          message.error(resp.msg);
        } else {
          history.goBack();
        }
      });
    },
    editScript: (data, callback) => {
      dispatch({
        type: `${namespace}/editScript`,
        payload: JSON.parse(JSON.stringify(data)),
      }).then(resp => {
        if (resp.msg != '') {
          message.error(resp.msg);
        } else {
          callback();
        }
      });
    },
    testScript: function(data) {
      dispatch({
        type: `${namespace}/testScript`,
        payload: data,
      }).then(resp => {
        clearInterval(this.idx);
        if (resp.msg != '') {
          message.error(resp.msg);
          this.setState({
            progressStatus: 'exception',
            progressDisabled: false,
          });
        } else {
          message.success('测试成功');
          this.setState({
            progressStatus: 'success',
            progressPercent: 100,
            progressDisabled: false,
          });
        }
      });
    },
  };
};
@connect(null, scriptModelEvent)
export default class create_edit extends PureComponent {
  constructor(props) {
    super(props);
    let data = this.getStateData();
    this.state = {
      ...data,

      progressDisabled: false,
      progressPercent: 0,
      progressStatus: '',
      progressIsShow: false,
    };
    this.form = React.createRef();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.script && this.props.script.name !== prevProps.script.name) {
      let script = this.getStateData();
      this.setState({
        ...script,
      });

      this.saveFormData(script);
    }
  }

  // 更新表单数据
  saveFormData = result => {
    let formData = {};

    if (result.name != undefined) {
      formData.name = result.name;
    }

    if (result.protocol != undefined) {
      formData.protocol = result.protocol;
    }

    if (result.data && result.data.url) {
      formData.url = result.data.url;
    }

    if (
      result.data &&
      result.data.httpOptions &&
      result.data.httpOptions.method != undefined
    ) {
      formData.method = result.data.httpOptions.method;
    }

    if (result.data && result.data.interval != undefined) {
      formData.interval = result.data.interval;
    }

    this.form.current.setFieldsValue({
      ...formData,
    });
  };

  getStateData = () => {
    let data = this.props.script ? this.props.script : false;
    if (data == false) {
      this.isUpdate = false;
      return {
        type: this.getType(),
        name: '',
        protocol: REQUEST_HTTP,
        data: {
          url: '',
          interval: 0,
          httpOptions: {
            method: defaultSelectedMethod,
            header: {},
            cookie: {},
          },
          sendData: {
            dataFieldList: [],
          },
          transactionOptions: {
            transactionOptionsData: [],
          },
        },
      };
    }
    this.isUpdate = true;
    return {
      id: data.ID,
      type: this.getType(),
      name: data.name,
      protocol: data.protocol,
      data: JSON.parse(data.data),
    };
  };

  getType = () => {
    if (this.props.location && this.props.location.query.type) {
      return this.props.location.query.type;
    }
    if (this.props.script) {
      return this.props.script.type;
    }
    return TYPE_COMMON;
  };

  handelName = e => {
    this.setState({
      name: e.target.value,
    });
  };

  handelProtocol = e => {
    this.setState({
      protocol: e,
    });
  };

  handelSubmit = () => {
    if (this.isUpdate) {
      this.props.editScript(this.state, this.props.updateCallback);
    } else {
      this.props.addScript(this.state);
    }
  };

  scriptTest = () => {
    if (this.state.progressDisabled) {
      message.warning('请勿重复点击');
      return;
    }
    this.setState({
      progressPercent: 0,
    });
    this.idx = setInterval(() => {
      this.setState(state => {
        let percent = parseInt(state.progressPercent) + 1;
        let status = 'active';
        return {
          progressPercent: percent,
          progressStatus: status,
        };
      });
    }, 100);

    this.setState({
      progressIsShow: true,
      progressDisabled: true,
    });
    this.props.testScript.call(this, JSON.parse(JSON.stringify(this.state)));
  };

  addTransactionRow = e => {
    let data = JSON.parse(JSON.stringify(this.state.data));
    data.transactionOptions.transactionOptionsData.push({
      name: '',
      url: '',
      interval: 0,
      sendData: {
        dataFieldList: [],
      },
    });
    this.setState({
      data: data,
    });
  };

  delTransactionRow = (index, e) => {
    let data = JSON.parse(JSON.stringify(this.state.data));
    data.transactionOptions.transactionOptionsData.splice(index, 1);
    this.setState({
      data: data,
    });
    e.stopPropagation();
  };

  copyTransactionRow = (index, e) => {
    let data = JSON.parse(JSON.stringify(this.state.data));
    let record = data.transactionOptions.transactionOptionsData[index];
    data.transactionOptions.transactionOptionsData.push(record);
    this.setState({
      data: data,
    });
    e.stopPropagation();
  };

  getValueToData = field => {
    let val = this.state.data[field];
    if (val == '' || val) {
      return val;
    }
    return '';
  };

  getValueToTransaction = () => {
    if (this.state.data.transactionOptions) {
      return this.state.data.transactionOptions.transactionOptionsData;
    }
    return [];
  };

  setValueToData = (field, e) => {
    let data = JSON.parse(JSON.stringify(this.state.data));
    let value = e && e.target ? e.target.value : e;

    data[field] = value;
    this.setState({
      data: data,
    });
  };

  setHttpOptions = (field, e) => {
    let data = JSON.parse(JSON.stringify(this.state.data));
    let value = e && e.target ? e.target.value : e;
    if (!data.httpOptions) {
      data.httpOptions = {};
    }
    data.httpOptions[field] = value;
    this.setState({
      data: data,
    });
    this.forceUpdate();
  };

  getHttpOptions = field => {
    if (!this.state.data.httpOptions[field]) {
      return '';
    }
    return this.state.data.httpOptions[field];
  };

  setSendData = e => {
    let data = JSON.parse(JSON.stringify(this.state.data));
    let value = e && e.target ? e.target.value : e;
    if (!data.sendData || !data.sendData.dataFieldList) {
      data.sendData = {
        dataFieldList: [],
      };
    }
    data.sendData.dataFieldList = value;
    this.setState({
      data: data,
    });
    this.forceUpdate();
  };

  getSendData = () => {
    if (this.state.data.sendData && this.state.data.sendData.dataFieldList) {
      return this.state.data.sendData.dataFieldList;
    }
    return {};
  };

  setTransactionData = (index, field, e) => {
    let data = JSON.parse(JSON.stringify(this.state.data));
    let value = e && e.target ? e.target.value : e;
    if (
      !data.transactionOptions ||
      !data.transactionOptions.transactionOptionsData
    ) {
      data.transactionOptions = {
        transactionOptionsData: [],
      };
    }
    data.transactionOptions.transactionOptionsData[index][field] = value;

    this.setState({
      data: data,
    });

    this.forceUpdate();
  };

  getTransactionData = (index, field) => {
    alert(index);
    if (
      !!this.state.data.transactionOptions ||
      !this.state.data.transactionOptions.transactionOptionsData ||
      !this.state.data.transactionOptions.transactionOptionsData[index] ||
      !this.state.data.transactionOptions.transactionOptionsData[index][field]
    ) {
      return '';
    }
    return this.state.data.transactionOptions.transactionOptionsData[index][
      field
    ];
  };

  setTransactionSendData = (index, e) => {
    let data = this.state.data;
    let value = e && e.target ? e.target.value : e;
    if (
      !data.transactionOptions.transactionOptionsData[index].sendData ||
      !data.transactionOptions.transactionOptionsData[index].sendData
        .dataFieldList
    ) {
      data.transactionOptions.transactionOptionsData[index].sendData = {
        dataFieldList: [],
      };
    }
    data.transactionOptions.transactionOptionsData[
      index
    ].sendData.dataFieldList = value;
    this.setState({
      data: data,
    });
    this.forceUpdate();
  };

  getTransactionSendData = index => {
    if (
      this.state.data.transactionOptions &&
      this.state.data.transactionOptions.transactionOptionsData[index]
        .sendData &&
      this.state.data.transactionOptions.transactionOptionsData[index].sendData
        .dataFieldList
    ) {
      return this.state.data.transactionOptions.transactionOptionsData[index]
        .sendData.dataFieldList;
    }
    return {};
  };

  setTransactionHttpOptions = (index, field, e) => {
    let data = JSON.parse(JSON.stringify(this.state.data));
    let value = e && e.target ? e.target.value : e;
    if (!data.transactionOptions.transactionOptionsData[index].httpOptions) {
      data.transactionOptions.transactionOptionsData[index].httpOptions = {};
    }
    data.transactionOptions.transactionOptionsData[index].httpOptions[
      field
    ] = value;
    this.setState({
      data: data,
    });
    this.forceUpdate();
  };

  getTransactionHttpOptions = (index, field) => {
    if (
      !this.state.data.transactionOptions ||
      !this.state.data.transactionOptions.transactionOptionsData ||
      !this.state.data.transactionOptions.transactionOptionsData[index]
        .httpOptions ||
      !this.state.data.transactionOptions.transactionOptionsData[index]
        .httpOptions[field]
    ) {
      return '';
    }
    return this.state.data.transactionOptions.transactionOptionsData[index]
      .httpOptions[field];
  };

  moveUpTransactionRow = (index, e) => {
    e.stopPropagation();
    if (index == 0) {
      return;
    }

    let prevIndex = index - 1;
    let data = JSON.parse(JSON.stringify(this.state.data));
    let transactionOptionsData = data.transactionOptions.transactionOptionsData;
    if (transactionOptionsData && transactionOptionsData[prevIndex]) {
      [transactionOptionsData[prevIndex], transactionOptionsData[index]] = [
        transactionOptionsData[index],
        transactionOptionsData[prevIndex],
      ];
    }

    this.setState({
      data: data,
    });
  };

  moveDwTransactionRow = (index, e) => {
    e.stopPropagation();
    let nextIndex = index + 1;
    let data = JSON.parse(JSON.stringify(this.state.data));
    let transactionOptionsData = data.transactionOptions.transactionOptionsData;

    if (transactionOptionsData.length - 1 == index) {
      return;
    }

    if (transactionOptionsData && transactionOptionsData[nextIndex]) {
      [transactionOptionsData[nextIndex], transactionOptionsData[index]] = [
        transactionOptionsData[index],
        transactionOptionsData[nextIndex],
      ];
    }

    this.setState({
      data: data,
    });
  };

  render() {
    return (
      <Fragment>
        <Form {...formItemLayout} onFinish={this.handelSubmit} ref={this.form}>
          <Form.Item
            initialValue={this.state.name}
            label="脚本名称"
            name="name"
            rules={[
              {
                required: true,
                message: '脚本名称不能为空',
              },
            ]}
          >
            <Input value={this.state.name} onChange={this.handelName} />
          </Form.Item>

          <Form.Item
            initialValue={this.state.protocol}
            label="协议"
            name="protocol"
            rules={[
              {
                required: true,
                message: '请选择协议',
              },
            ]}
          >
            <Select onChange={this.handelProtocol}>
              <Option value={REQUEST_HTTP}>HTTP</Option>
              <Option value={REQUEST_TCP}>TCP</Option>
            </Select>
          </Form.Item>

          {this.getType() == TYPE_COMMON ? (
            <Fragment>
              <Form.Item
                initialValue={this.getValueToData('url')}
                label="URL"
                name="url"
                rules={[
                  {
                    required: true,
                    message: '请填写URL',
                  },
                ]}
              >
                <Input onChange={this.setValueToData.bind(this, 'url')} />
              </Form.Item>

              <Form.Item
                initialValue={this.getValueToData('interval')}
                label="间隔时间"
                name="interval"
              >
                <InputNumber
                  size="small"
                  onChange={this.setValueToData.bind(this, 'interval')}
                  style={{ width: 100 }}
                  type="text"
                />
              </Form.Item>

              {this.state.protocol == REQUEST_HTTP ? (
                <Form.Item
                  initialValue={this.getHttpOptions('method')}
                  name="method"
                  label="Method"
                >
                  <Radio.Group
                    onChange={this.setHttpOptions.bind(this, 'method')}
                  >
                    {defaultMethods.map(function(item, index) {
                      return (
                        <Radio key={index} value={item}>
                          {item}
                        </Radio>
                      );
                    })}
                  </Radio.Group>
                </Form.Item>
              ) : null}
            </Fragment>
          ) : null}

          <Form.Item label="参数">
            <div
              style={{
                background: '#fbfbfb',
                border: '1px solid #d9d9d9',
                padding: 10,
              }}
            >
              {this.getType() == TYPE_COMMON ? (
                <Form.Item>
                  <Tabs defaultActiveKey="1">
                    <TabPane tab="Body" key="1">
                      <Body
                        data={this.getSendData()}
                        render={this.setSendData}
                      ></Body>
                    </TabPane>
                    {this.state.protocol == REQUEST_HTTP ? (
                      <TabPane tab="Header" key="2">
                        <Kv
                          data={this.getHttpOptions('header')}
                          render={this.setHttpOptions.bind(this, 'header')}
                        ></Kv>
                      </TabPane>
                    ) : null}
                    {this.state.protocol == REQUEST_HTTP ? (
                      <TabPane tab="Cookie" key="3">
                        <Kv
                          data={this.getHttpOptions('cookie')}
                          render={this.setHttpOptions.bind(this, 'cookie')}
                        ></Kv>
                      </TabPane>
                    ) : null}
                  </Tabs>
                </Form.Item>
              ) : null}

              {this.getType() == TYPE_TRANSACTION ? (
                <Form.Item
                  style={{
                    display:
                      this.state.type == TYPE_TRANSACTION ? null : 'none',
                  }}
                >
                  <div style={{ width: '100%', height: 32 }}>
                    <Button
                      size="small"
                      style={{ position: 'absolute', right: '10px' }}
                      type="dashed"
                      onClick={this.addTransactionRow}
                    >
                      新增事务
                    </Button>
                  </div>
                  <Collapse
                    expandIconPosition="right"
                    bordered={true}
                    expandIcon={({ isActive }) => {
                      return isActive ? (
                        <CaretDownOutlined />
                      ) : (
                        <CaretRightOutlined />
                      );
                    }}
                  >
                    {this.getValueToTransaction().map((item, index) => {
                      return (
                        <Panel
                          extra={
                            <div>
                              <CopyrightCircleOutlined
                                onClick={this.copyTransactionRow.bind(
                                  this,
                                  index,
                                )}
                              />
                              &nbsp;&nbsp;&nbsp;
                              <UpCircleOutlined
                                onClick={this.moveUpTransactionRow.bind(
                                  this,
                                  index,
                                )}
                              />
                              &nbsp;&nbsp;&nbsp;
                              <DownCircleOutlined
                                onClick={this.moveDwTransactionRow.bind(
                                  this,
                                  index,
                                )}
                              />
                              &nbsp;&nbsp;&nbsp;
                              <DeleteOutlined
                                onClick={this.delTransactionRow.bind(
                                  this,
                                  index,
                                )}
                              />
                            </div>
                          }
                          header={item.name}
                          key={index}
                          style={customPanelStyle}
                        >
                          <Form.Item label="名称">
                            <Input
                              onChange={this.setTransactionData.bind(
                                this,
                                index,
                                'name',
                              )}
                              value={item.name}
                            />
                          </Form.Item>

                          <Form.Item label="URL">
                            <Input
                              onChange={this.setTransactionData.bind(
                                this,
                                index,
                                'url',
                              )}
                              value={item.url}
                            />
                          </Form.Item>

                          <Form.Item
                            style={{
                              display:
                                this.state.protocol != REQUEST_TCP
                                  ? null
                                  : 'none',
                            }}
                            label="Method"
                          >
                            <Radio.Group
                              onChange={this.setTransactionHttpOptions.bind(
                                this,
                                index,
                                'method',
                              )}
                              value={
                                this.getTransactionHttpOptions(index, 'method')
                                  ? this.getTransactionHttpOptions(
                                      index,
                                      'method',
                                    )
                                  : defaultSelectedMethod
                              }
                            >
                              {defaultMethods.map(function(item, index) {
                                return (
                                  <Radio key={index} value={item}>
                                    {item}
                                  </Radio>
                                );
                              })}
                            </Radio.Group>
                          </Form.Item>

                          <Form.Item label="间隔时间">
                            <InputNumber
                              size="small"
                              onChange={this.setTransactionData.bind(
                                this,
                                index,
                                'interval',
                              )}
                              style={{ width: 100 }}
                              type="text"
                              value={item.interval ? item.interval : 0}
                            />
                          </Form.Item>

                          <Form.Item label="参数">
                            <Tabs defaultActiveKey="1">
                              <TabPane tab="Body" key="1">
                                <Body
                                  data={this.getTransactionSendData(index)}
                                  render={this.setTransactionSendData.bind(
                                    this,
                                    index,
                                  )}
                                ></Body>
                              </TabPane>
                              {this.state.protocol == REQUEST_HTTP ? (
                                <TabPane tab="Header" key="2">
                                  <Kv
                                    data={this.getTransactionHttpOptions(
                                      index,
                                      'header',
                                    )}
                                    render={this.setTransactionHttpOptions.bind(
                                      this,
                                      index,
                                      'header',
                                    )}
                                  ></Kv>
                                </TabPane>
                              ) : null}
                              {this.state.protocol == REQUEST_HTTP ? (
                                <TabPane tab="Cookie" key="3">
                                  <Kv
                                    data={this.getTransactionHttpOptions(
                                      index,
                                      'cookie',
                                    )}
                                    render={this.setTransactionHttpOptions.bind(
                                      this,
                                      index,
                                      'cookie',
                                    )}
                                  ></Kv>
                                </TabPane>
                              ) : null}
                            </Tabs>
                          </Form.Item>
                        </Panel>
                      );
                    })}
                  </Collapse>
                </Form.Item>
              ) : null}
            </div>
          </Form.Item>

          <Form.Item wrapperCol={{ sm: { offset: 4 } }}>
            <div style={{ display: this.state.progressIsShow ? null : 'none' }}>
              <Progress
                percent={this.state.progressPercent}
                status={this.state.progressStatus}
                size="small"
              />
            </div>

            {this.isUpdate ? (
              <Popconfirm
                title="同时初始化关联此脚本的任务,确认提交？"
                okText="Yes"
                cancelText="No"
                onConfirm={this.handelSubmit.bind(this)}
              >
                <Button type="primary" htmlType="submit">
                  提交
                </Button>
              </Popconfirm>
            ) : (
              <Button type="primary" htmlType="submit">
                提交
              </Button>
            )}

            <Button
              style={{ marginLeft: 10 }}
              type="dashed"
              onClick={this.scriptTest}
            >
              测试脚本
            </Button>
          </Form.Item>
        </Form>
      </Fragment>
    );
  }
}
