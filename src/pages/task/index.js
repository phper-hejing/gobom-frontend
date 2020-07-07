import React, { PureComponent } from 'react';
import { Row, Col, Card, Statistic } from 'antd';

export default class script extends PureComponent {
  render() {
    return (
      <div>
        <Row>
          <Col span={18}>
            <div style={{ height: 500 }}>
              <Row>
                <Col span={6}>
                  <Card title={false} size="small" style={{ width: 300 }}>
                    <div>
                      <Statistic title="成功数" value={112893} />
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ height: 500 }}></div>
          </Col>
        </Row>
      </div>
    );
  }
}
