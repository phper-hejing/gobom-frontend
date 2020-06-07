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
        payload: data,
      }).then(resp => {
        if (resp.msg != '') {
          message.error(resp.msg);
        } else {
          history.goBack()
        }
      });
    },
    editScript: (data, callback) => {
      dispatch({
        type: `${namespace}/editScript`,
        payload: data,
      }).then(resp => {
        if (resp.msg != '') {
          message.error(resp.msg);
        } else {
          callback()
        }
      });
    }
  };
};
@connect(null, scriptModelEvent)
export default class create_edit extends PureComponent {


  constructor(props) {
    super(props);
    let data = this.getStateData()
    this.state = {
      ...data
    }
    this.form = React.createRef()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.script && (this.props.script.name !== prevProps.script.name)) {
      let script = this.getStateData()
      this.setState({
        ...script
      })

      // 需要手动更新表单数据
      let data = script.data
      let formData = {
        name: script.name,
        protocol: script.protocol,
        url: data.url,
        method: data.httpOptions.method
      }
      for (let i in data.transactionOptionsData) {
        formData["item_name".i] = data.transactionOptionsData[i].name;
        formData["item_url".i] = data.transactionOptionsData[i].url;
        formData["item_method".i] = data.transactionOptionsData[i].method;
        formData["item_inteval".i] = data.transactionOptionsData[i].interval;
      }
      this.form.current.setFieldsValue({
        ...formData
      })
    }
  }

  getStateData = () => {
    let data = this.props.script ? this.props.script : false;
    if (data == false) {
      this.isUpdate = false
      return {
        type: this.getType(),
        name: "",
        protocol: REQUEST_HTTP,
        data: {
          url: '',
          httpOptions: {
            method: defaultSelectedMethod,
            header: {},
            cookie: {},
          },
          sendData: {
            dataFieldList: [],
          },
          transactionOptionsData: [],
        },
      }
    }
    this.isUpdate = true
    return {
        id: data.ID,
        type: this.getType(),
        name: data.name,
        protocol: data.protocol,
        data: JSON.parse(data.data),
      }
  }

  getType = () => {
    if (this.props.location && this.props.location.query.type) {
      return this.props.location.query.type
    }
    if (this.props.script) {
      return this.props.script.type
    }
    return TYPE_COMMON
  }

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

  addTransactionRow = e => {
    let data = this.state.data;
    data.transactionOptionsData.push({
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
    this.forceUpdate();
  };

  delTransactionRow = (index, e) => {
    let data = this.state.data;
    data.transactionOptionsData.splice(index, 1);
    this.setState({
      data: data,
    });
    this.forceUpdate();
    e.stopPropagation();
  };

  getValueToData = field => {
    let val = this.state.data[field];
    if (val == '' || val) {
      return val;
    }
    return '';
  };

  setValueToData = (field, e) => {
    let data = this.state.data;
    let value = e && e.target ? e.target.value : e;

    data[field] = value;
    this.setState({
      data: data,
    });
  };

  setHttpOptions = (field, e) => {
    let data = this.state.data;
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
    let data = this.state.data;
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
    let data = this.state.data;
    let value = e && e.target ? e.target.value : e;
    if (!data.transactionOptionsData) {
      data.transactionOptionsData = [];
    }
    data.transactionOptionsData[index][field] = value;
    this.setState({
      data: data,
    });
    this.forceUpdate();
  };

  getTransactionData = (index, field) => {
    alert(index);
    if (
      !this.state.data.transactionOptionsData ||
      this.state.data.transactionOptionsData[index] ||
      this.state.data.transactionOptionsData[index][field]
    ) {
      return '';
    }
    return this.state.data.transactionOptionsData[index][field];
  };

  setTransactionSendData = (index, e) => {
    let data = this.state.data;
    let value = e && e.target ? e.target.value : e;
    if (
      !data.transactionOptionsData[index].sendData ||
      !data.transactionOptionsData[index].sendData.dataFieldList
    ) {
      data.transactionOptionsData[index].sendData = {
        dataFieldList: [],
      };
    }
    data.transactionOptionsData[index].sendData.dataFieldList = value;
    this.setState({
      data: data,
    });
    this.forceUpdate();
  };

  getTransactionSendData = index => {
    if (
      this.state.data.transactionOptionsData[index].sendData &&
      this.state.data.transactionOptionsData[index].sendData.dataFieldList
    ) {
      return this.state.data.transactionOptionsData[index].sendData
        .dataFieldList;
    }
    return {};
  };

  setTransactionHttpOptions = (index, field, e) => {
    let data = this.state.data;
    let value = e && e.target ? e.target.value : e;
    if (!data.transactionOptionsData[index].httpOptions) {
      data.transactionOptionsData[index].httpOptions = {};
    }
    data.transactionOptionsData[index].httpOptions[field] = value;
    this.setState({
      data: data,
    });
    this.forceUpdate();
  };

  getTransactionHttpOptions = (index, field) => {
    if (
      !this.state.data.transactionOptionsData[index].httpOptions ||
      !this.state.data.transactionOptionsData[index].httpOptions[field]
    ) {
      return '';
    }
    return this.state.data.transactionOptionsData[index].httpOptions[field];
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

          <Form.Item
            initialValue={this.getValueToData('url')}
            style={{ display: this.state.type == TYPE_COMMON ? null : 'none' }}
            label="URL"
            name="url"
            rules={
              this.state.type == TYPE_COMMON
                ? [
                    {
                      required: true,
                      message: '请填写URL',
                    },
                  ]
                : null
            }
          >
            <Input onChange={this.setValueToData.bind(this, 'url')} />
          </Form.Item>

          <Form.Item
            initialValue={this.getHttpOptions('method')}
            style={{ display: this.state.protocol == REQUEST_HTTP ? null : 'none' }}
            name="method"
            label="Method"
          >
            <Radio.Group onChange={this.setHttpOptions.bind(this, 'method')}>
              {defaultMethods.map(function(item, index) {
                return (
                  <Radio key={index} value={item}>
                    {item}
                  </Radio>
                );
              })}
            </Radio.Group>
          </Form.Item>

          <Form.Item label="参数">
            <div
              style={{
                background: '#fbfbfb',
                border: '1px solid #d9d9d9',
                padding: 10,
              }}
            >
              <Form.Item
                style={{
                  display: this.state.type == TYPE_COMMON ? null : 'none',
                }}
              >
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

              <Form.Item
                style={{
                  display: this.state.type == TYPE_TRANSACTION ? null : 'none',
                }}
              >
                <div style={{ width: '100%', height: 32 }}>
                  <Button
                    size="small"
                    style={{ position: 'absolute', right: '100px' }}
                    type="dashed"
                    onClick={this.addTransactionRow}
                  >
                    新增事务
                  </Button>
                  <Button
                    size="small"
                    style={{ position: 'absolute', right: '10px' }}
                    type="dashed"
                  >
                    测试事务
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
                  {this.getValueToData('transactionOptionsData')
                    ? this.getValueToData('transactionOptionsData').map(
                        (item, index) => {
                          return (
                            <Panel
                              extra={
                                <MinusCircleOutlined
                                  onClick={this.delTransactionRow.bind(
                                    this,
                                    index,
                                  )}
                                />
                              }
                              header={item.name}
                              key={index}
                              style={customPanelStyle}
                            >
                              <Form.Item
                                initialValue={item.name}
                                name={`item_name${index}`}
                                label="名称"
                                rules={[
                                  {
                                    required: true,
                                    message: '请填写名称',
                                  },
                                ]}
                              >
                                <Input
                                  onChange={this.setTransactionData.bind(
                                    this,
                                    index,
                                    'name',
                                  )}
                                />
                              </Form.Item>

                              <Form.Item
                                initialValue={item.url}
                                name={`item_url${index}`}
                                label="URL"
                                rules={[
                                  {
                                    required: true,
                                    message: '请填写URL',
                                  },
                                ]}
                              >
                                <Input
                                  onChange={this.setTransactionData.bind(
                                    this,
                                    index,
                                    'url',
                                  )}
                                />
                              </Form.Item>

                              <Form.Item
                                initialValue={
                                  item.method
                                    ? item.method
                                    : defaultSelectedMethod
                                }
                                style={{
                                  display:
                                    this.state.protocol != REQUEST_TCP
                                      ? null
                                      : 'none',
                                }}
                                name={`item_method${index}`}
                                label="Method"
                              >
                                <Radio.Group
                                  onChange={this.setTransactionData.bind(
                                    this,
                                    index,
                                    'method',
                                  )}
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

                              <Form.Item
                                initialValue={item.interval ? item.interval : 0}
                                name={`item_interval${index}`}
                                label="间隔时间"
                              >
                                <InputNumber
                                  size="small"
                                  onChange={this.setTransactionData.bind(
                                    this,
                                    index,
                                    'interval',
                                  )}
                                  style={{ width: 100 }}
                                  type="text"
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
                        },
                      )
                    : null}
                </Collapse>
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item wrapperCol={{ sm: { offset: 4 } }}>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Fragment>
    );
  }
}
