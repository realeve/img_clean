import { useState } from 'react';
import { Button, Table } from 'antd';
import { ICartItem } from './db';
import ResultPanel from './ResultPanel';
import useFetch from '@/component/hooks/useFetch';
import { DEV, IAxiosState } from '@/utils/axios';
import { imageSearchUrl } from '@/utils/setting';

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
            title: <span style={{ color: 'red' }}>AI漏检</span>,
            key: '审核实废',
            dataIndex: 'leak_normal_fake_img',
            render: (text, record) => (
              <span style={{ color: record.id == 0 ? 'red' : 'unset' }}>
                {Number(text).toFixed(1)}
              </span>
            ),
          },
          {
            title: '人工误判',
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
            title: <span style={{ color: 'red' }}>人工漏检</span>,
            key: '审核实废',
            dataIndex: 'err_fake_fake_img',
            render: (text, record) => (
              <span style={{ color: record.id == 0 ? 'red' : 'unset' }}>
                {Number(text).toFixed(1)}
              </span>
            ),
          },
          {
            title: 'AI误判',
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
    render: (text) => <span>{Number(text).toFixed(0)}</span>,
  },
  {
    title: '准确率',
    children: [
      {
        title: 'AI准确率',
        children: [
          {
            title: '图核判废',
            key: '图核判废',
            dataIndex: 'acc',
            render: (text) => <span>{Number(text).toFixed(2)}%</span>,
          },
          {
            title: <span style={{ color: 'red' }}>实物审核</span>,
            key: '实物审核',
            dataIndex: 'acc_fix',
            render: (text, record) => (
              <span style={{ color: record.id == 0 ? 'red' : 'unset' }}>
                {Number(text).toFixed(2)}%
              </span>
            ),
          },
        ],
      },
      {
        title: <span style={{ color: 'red' }}>人工准确率</span>,
        key: '人工判废',
        dataIndex: 'accHuman',
        render: (text, record) => (
          <span style={{ color: record.id == 0 ? 'red' : 'unset' }}>
            {Number(text).toFixed(2)}%
          </span>
        ),
      },
    ],
  },
  {
    title: '* 不计废',
    key: 'ignore_img',
    dataIndex: 'ignore_img',
    render: (text) => <span>{Number(text).toFixed(1)}</span>,
  },
];

export default () => {
  const { data, loading } = useFetch({
    param: {
      url: DEV ? '@/mock/1430_d55a6e3d81.json' : '/1459/779881902e.json',
    },
    callback: (res: IAxiosState<ICartItem>) =>
      res.data.map((item, i) => ({
        ...item,
        idx: i || '',
        acc: Number(item.acc),
        accHuman:
          100 -
          ((Number(item.leak_normal_normal_img) +
            Number(item.err_fake_fake_img)) *
            100) /
            Number(item.total_img),
      })),
  });

  const [show, setShow] = useState(false);
  const [cartinfo, setCartinfo] = useState({
    cartnumber: '',
    id: '0',
  });

  return (
    <div className="card-content">
      <h3>实物审核数据汇总</h3>
      <div>
        <b>* 不计废图像数量：</b>
        如果一开产品存在人工及AI同时判为实废，产品将在实物剔废单中，如果同一开位出现人工或AI漏检，为方便分析，该图像不计入作废分析中。
      </div>
      <ResultPanel show={show} setShow={setShow} cartinfo={cartinfo} />
      <Table
        dataSource={data}
        // loading={loading}
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
              ),
          },
        ]}
      />
    </div>
  );
};
