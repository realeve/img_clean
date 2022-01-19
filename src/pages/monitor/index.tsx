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

const getYesterday = () => {
  return moment()
    .subtract(moment().format('E') == 1 ? 3 : 1, 'days')
    .format(dateFormat);
};

export default () => {
  const [state, setState] = useState({
    tstart: '',
    tend: '',
  });
  const [data, setData] = useState<ICartItem[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    db.getCartsDateRange().then(setState);
  }, []);
  useEffect(() => {
    if (!/\d{8}/.test(state.tstart)) {
      return;
    }
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
          pageSize: 12,
        }}
      >
        <Column title="#" dataIndex="idx" key="idx" />
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
        <Column title="判废时间" dataIndex="judge_date" key="判废时间" />
        <Column title="冠号" dataIndex="head" key="冠号" />
        <Column
          title="AI漏检"
          dataIndex="leak_normal_img"
          key="AI漏检"
          render={(text) => <span>{Number(text).toFixed(1)}</span>}
        />
        <Column
          title="AI漏检(审核实废)"
          dataIndex="leak_normal_fake_img"
          key="AI漏检1"
          render={(text) => <span>{Number(text).toFixed(1)}</span>}
        />
        <Column
          title="AI漏检(审核误判)"
          dataIndex="leak_normal_normal_img"
          key="AI漏检2"
          render={(text) => <span>{Number(text).toFixed(1)}</span>}
        />
        <Column
          title="共同检出误废"
          dataIndex="normal_img"
          key="共同检出误废"
          render={(text) => <span>{Number(text).toFixed(1)}</span>}
        />
        <Column
          title="AI误检"
          dataIndex="err_fake_img"
          key="AI误检"
          render={(text) => <span>{Number(text).toFixed(1)}</span>}
        />
        <Column
          title="AI误检(审核实废)"
          dataIndex="err_fake_fake_img"
          key="AI误检1"
          render={(text) => <span>{Number(text).toFixed(1)}</span>}
        />
        <Column
          title="AI误检(审核误判)"
          dataIndex="err_fake_normal_img"
          key="AI误检2"
          render={(text) => <span>{Number(text).toFixed(1)}</span>}
        />
        <Column
          title="共同检出实废"
          dataIndex="fake_img"
          key="共同检出实废"
          render={(text) => <span>{Number(text).toFixed(1)}</span>}
        />
        <Column
          title="图片总数"
          dataIndex="total_img"
          key="图片总数"
          render={(text) => <span>{Number(text).toFixed(1)}</span>}
        />
        <Column
          title="准确率"
          dataIndex="acc"
          key="准确率"
          render={(text) => <span>{text}%</span>}
        />
        <Column
          title="准确率(二次审核)"
          dataIndex="acc_fix"
          key="准确率2"
          render={(text) => <span>{Number(text).toFixed(2)}%</span>}
        />
        <Column
          title="操作"
          key="id"
          render={(text, record: ICartItem) =>
            record.id > '0' ? (
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
                查看图片
              </Button>
            ) : (
              <span>{data.length - 1} 万</span>
            )
          }
        />
      </Table>
    </div>
  );
};
