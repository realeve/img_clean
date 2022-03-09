import { useState } from 'react';
import { Button, Table, Tooltip } from 'antd';
import { ICartItem } from './db';
import ResultPanel from './ResultPanel';
import useFetch from '@/component/hooks/useFetch';
import { DEV, IAxiosState } from '@/utils/axios';
import { imageSearchUrl } from '@/utils/setting';
import { QuestionCircleOutlined } from '@ant-design/icons';

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
            title: (
              <span style={{ color: 'red' }}>
                <Tooltip
                  title={
                    <div>
                      以实物审核为标准统计AI最终漏检。同时满足以下条件：
                      <br />
                      人工判实废、AI判误废、实物判实废
                    </div>
                  }
                >
                  <QuestionCircleOutlined />
                </Tooltip>
                AI漏检
              </span>
            ),
            key: '审核实废',
            dataIndex: 'leak_normal_fake_img',
            render: (text, record) => (
              <span style={{ color: record.id == 0 ? 'red' : 'unset' }}>
                {Number(text).toFixed(1)}
              </span>
            ),
          },
          {
            title: (
              <span>
                <Tooltip
                  title={
                    <div>
                      以实物审核为标准统计图核人工判为实废的图像中误判部分。同时满足以下条件：
                      <br />
                      人工判实废、AI判误废、实物判误废
                    </div>
                  }
                >
                  <QuestionCircleOutlined />
                </Tooltip>
                人工误判
              </span>
            ),
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
            title: (
              <span style={{ color: 'red' }}>
                <Tooltip
                  title={
                    <div>
                      以实物审核为标准统计人工最终漏检。同时满足以下条件：
                      <br />
                      人工判误废、AI判实废、实物判实废
                    </div>
                  }
                >
                  <QuestionCircleOutlined />
                </Tooltip>
                人工漏检
              </span>
            ),
            key: '审核实废',
            dataIndex: 'err_fake_fake_img',
            render: (text, record) => (
              <span style={{ color: record.id == 0 ? 'red' : 'unset' }}>
                {Number(text).toFixed(1)}
              </span>
            ),
          },
          {
            title: (
              <span>
                <Tooltip
                  title={
                    <div>
                      以实物审核为标准统计AI最终误检。同时满足以下条件：
                      <br />
                      人工判误废、AI判实废、实物判误废
                    </div>
                  }
                >
                  <QuestionCircleOutlined />
                </Tooltip>
                AI误判
              </span>
            ),
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
    title: (
      <Tooltip title="如果一开产品存在人工及AI同时判为实废，产品将在实物剔废单中，如果同一开位出现人工或AI漏检，为方便分析，该图像不计入作废分析中。">
        <QuestionCircleOutlined /> <span>不计废</span>
      </Tooltip>
    ),
    key: 'ignore_img',
    dataIndex: 'ignore_img',
    render: (text) => <span>{Number(text).toFixed(1)}</span>,
  },
  {
    title: (
      <span>
        <Tooltip title="不包含不计废图片">
          <QuestionCircleOutlined />
        </Tooltip>
        图片总数
      </span>
    ),
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
            title: (
              <span>
                <Tooltip
                  title={
                    <div>
                      以图像核查为标准计算AI初次判废准确率。
                      <br />
                      准确率 = 100-(AI漏检+AI误判)*100/总条数
                    </div>
                  }
                >
                  <QuestionCircleOutlined />
                </Tooltip>
                图核判废
              </span>
            ),
            key: '图核判废',
            dataIndex: 'acc',
            render: (text) => <span>{Number(text).toFixed(2)}%</span>,
          },
          {
            title: (
              <span style={{ color: 'red' }}>
                <Tooltip
                  title={
                    <div>
                      以实物审核为标准计算AI判废系统最终判废准确率。
                      <br />
                      AI判废准确率 = 100-(AI漏检+AI误判)*100/(总条数-不计废)
                    </div>
                  }
                >
                  <QuestionCircleOutlined />
                </Tooltip>
                实物审核
              </span>
            ),
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
        title: (
          <span style={{ color: 'red' }}>
            <Tooltip
              title={
                <div>
                  以实物审核为标准计算人工最终判废准确率。
                  <br />
                  人工判废准确率 = 100-(人工漏检+人工误判)*100/(总条数-不计废)
                </div>
              }
            >
              <QuestionCircleOutlined />
            </Tooltip>
            人工准确率
          </span>
        ),
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
];

export default () => {
  const { data, loading } = useFetch({
    param: {
      url: DEV ? '@/mock/1430_d55a6e3d81.json' : '/1459/779881902e.json',
    },
    callback: (res: IAxiosState<ICartItem>) =>
      res.data.map((item, i) => {
        return {
          ...item,
          idx: i || '',
          acc: Number(item.acc),
          accHuman:
            100 -
            ((Number(item.leak_normal_normal_img) +
              Number(item.err_fake_fake_img)) *
              100) /
              Number(item.total_img),
        };
      }),
  });

  const [show, setShow] = useState(false);
  const [cartinfo, setCartinfo] = useState({
    cartnumber: '',
    id: '0',
  });

  const [size, setSize] = useState(25);

  return (
    <div className="card-content">
      <h2 style={{ textAlign: 'center' }}>实物审核数据汇总</h2>
      <div>
        <b>* 不计废图像数量：</b>
        如果一开产品存在人工及AI同时判为实废，产品将在实物剔废单中，如果同一开位出现人工或AI漏检，为方便分析，该图像不计入作废分析中。
        <br />
        (鼠标移至表头问号处显示该列数据说明及计算规则)
      </div>
      <ResultPanel show={show} setShow={setShow} cartinfo={cartinfo} />
      <Table
        dataSource={data}
        // loading={loading}
        pagination={{
          pageSizeOptions: ['10', '25', '50', '100'],
          pageSize: size,
          onChange: (page, pageSize) => {
            pageSize && setSize(pageSize);
          },
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
