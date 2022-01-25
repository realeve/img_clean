import { useState, useEffect } from 'react';
import DatePicker from '@/component/DatePicker';
import moment from 'moment';
import { Button, Table } from 'antd';
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

const columns = [
  {
    title: '#',
    dataIndex: 'idx',
    key: 'idx',
  },
  {
    title: '车号',
    dataIndex: 'cart',
    key: '车号',
    render: (text, record: ICartItem) =>
      record.id == '0' ? (
        text
      ) : (
        <span>
          <a target="_blank" href={imageSearchUrl + text}>
            {text}
          </a>
        </span>
      ),
  },
  {
    title: '判废时间',
    dataIndex: 'judge_date',
    key: '判废时间',
  },
  {
    title: '冠号',
    key: '冠号',
    dataIndex: 'head',
  },
  {
    title: 'AI误废',
    children: [
      {
        title: 'AI漏检',
        children: [
          {
            title: '审核实废',
            key: '审核实废',
            dataIndex: 'leak_normal_fake_img',
            render: (text) => <span>{Number(text).toFixed(1)}</span>,
          },
          {
            title: '审核误判',
            key: '审核误判',
            dataIndex: 'leak_normal_normal_img',
            render: (text) => <span>{Number(text).toFixed(1)}</span>,
          },
          {
            title: '合计',
            key: '合计',
            dataIndex: 'leak_normal_img',
            render: (text) => <span>{Number(text).toFixed(1)}</span>,
          },
        ],
      },
      {
        title: '共同检出误废',
        key: '共同检出误废',
        dataIndex: 'normal_img',
        render: (text) => <span>{Number(text).toFixed(1)}</span>,
      },
    ],
  },
  {
    title: 'AI实废',
    children: [
      {
        title: 'AI误检',
        children: [
          {
            title: '审核实废',
            key: '审核实废',
            dataIndex: 'err_fake_fake_img',
            render: (text) => <span>{Number(text).toFixed(1)}</span>,
          },
          {
            title: '审核误判',
            key: '审核误判',
            dataIndex: 'err_fake_normal_img',
            render: (text) => <span>{Number(text).toFixed(1)}</span>,
          },
          {
            title: '合计',
            key: '合计',
            dataIndex: 'err_fake_img',
            render: (text) => <span>{Number(text).toFixed(1)}</span>,
          },
        ],
      },
      {
        title: '共同检出实废',
        key: '共同检出实废',
        dataIndex: 'fake_img',
        render: (text) => <span>{Number(text).toFixed(1)}</span>,
      },
    ],
  },
  {
    title: '图片总数',
    key: '图片总数',
    dataIndex: 'total_img',
    render: (text) => <span>{Number(text).toFixed(1)}</span>,
  },
  {
    title: '准确率',
    children: [
      {
        title: '图核判废',
        key: '图核判废',
        dataIndex: 'acc',
        render: (text) => <span>{Number(text).toFixed(2)}%</span>,
      },
      {
        title: '二次审核',
        key: '二次审核',
        dataIndex: 'acc_fix',
        render: (text) => <span>{Number(text).toFixed(2)}%</span>,
      },
    ],
  },
];

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
        bordered
        columns={[
          ...columns,
          {
            title: '操作',
            key: '操作',
            dataIndex: 'id',
            render: (text, record: ICartItem) =>
              record.id > '0' ? (
                <>
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
                  <a
                    href={`/monitor/${
                      record.judge_result == '0' ? 'judge' : 'checklist'
                    }/${record.cart}`}
                    target="_blank"
                    className={`ant-btn ant-btn-${
                      record.judge_result == '1' ? 'primary' : 'link'
                    } ant-btn-sm`}
                    style={{ marginLeft: 10 }}
                  >
                    {record.judge_result == '0' ? '判废' : '打单'}
                  </a>
                </>
              ) : (
                <span>{data.length - 1} 万</span>
              ),
          },
        ]}
      />
    </div>
  );
};
