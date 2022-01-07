import React, { useState, useEffect } from 'react';
import DatePicker from '@/component/DatePicker';
import moment from 'moment';
import { Button, Table, Divider } from 'antd';
import * as db from './db';
import { ICartItem } from './db';
import { imageSearchUrl } from '@/utils/setting';
import ResultPanel from './ResultPanel';

const dateFormat = 'YYYYMMDD';
const Column = Table.Column;

export default () => {
  const [state, setState] = useState({
    tstart: moment().format(dateFormat),
    tend: moment().format(dateFormat),
  });
  const [data, setData] = useState<ICartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    db.getCarts(state)
      .then(setData)
      .finally(() => {
        setLoading(false);
      });
  }, [state]);

  const [show, setShow] = useState(false);
  const [cartinfo, setCartinfo] = useState({
    cartnumber: '',
    id: '0',
  });

  return (
    <div
      className="card-content"
      style={{ position: 'relative', paddingTop: 40 }}
    >
      <DatePicker
        value={[state.tstart, state.tend]}
        onChange={([tstart, tend]: [string, string]) => {
          const res = {
            tstart: moment(tstart).format(dateFormat),
            tend: moment(tend).format(dateFormat),
          };
          if (JSON.stringify(res) == JSON.stringify(state)) {
            return;
          }
          setState(res);
        }}
        style={{ position: 'absolute', right: 10, top: 10 }}
        format="YYYYMMDD"
      />
      <ResultPanel show={show} setShow={setShow} cartinfo={cartinfo} />
      <Table
        dataSource={data}
        loading={loading}
        pagination={{
          pageSize: 20,
        }}
      >
        <Column
          title="车号"
          dataIndex="cart"
          key="车号"
          render={(text, record: ICartItem) =>
            record.id == '0' ? (
              text
            ) : (
              <span>
                <a target="_blank" href={imageSearchUrl + text}>
                  {text}
                </a>
              </span>
            )
          }
        />
        <Column
          title="机检检测时间"
          dataIndex="check_date"
          key="机检检测时间"
        />
        <Column title="AI漏检" dataIndex="leak_normal_img" key="AI漏检" />
        <Column
          title="共同检出误废"
          dataIndex="normal_img"
          key="共同检出误废"
        />
        <Column title="AI误检" dataIndex="err_fake_img" key="AI误检" />
        <Column title="共同检出实废" dataIndex="fake_img" key="共同检出实废" />
        <Column title="图片总数" dataIndex="total_img" key="图片总数" />
        <Column
          title="准确率"
          dataIndex="acc"
          key="准确率"
          render={(text) => <span>{text}%</span>}
        />
        <Column
          title="操作"
          key="id"
          render={(text, record: ICartItem) =>
            record.id > '0' && (
              <span>
                <Button
                  type="dashed"
                  size="small"
                  onClick={() => {
                    setCartinfo({
                      id: record.id,
                      cartnumber: record.cart,
                    });
                    setShow(true);
                  }}
                >
                  查看
                </Button>
                <Divider type="vertical" />
                <a href="#">数据判废</a>
              </span>
            )
          }
        />
      </Table>
    </div>
  );
};
