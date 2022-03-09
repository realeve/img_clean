import { useState, useEffect } from 'react';
import DatePicker from '@/component/DatePicker';
import moment from 'moment';
import { Button, Table, Tooltip } from 'antd';
import * as db from './db';
import { ICartItem } from './db';
import { imageSearchUrl } from '@/utils/setting';
import ResultPanel from './ResultPanel';
import useFetch from '@/component/hooks/useFetch';
import { DEV, IAxiosState } from '@/utils/axios';
import { QuestionCircleOutlined } from '@ant-design/icons';

const dateFormat = 'YYYYMMDD';

export const columns = [
  {
    title: '#',
    dataIndex: 'idx',
    key: 'idx',
    width: '40px',
  },
  {
    title: '车号',
    dataIndex: 'cart',
    key: '车号',
    width: '80px',
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
    width: '160px',
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
                      以图像核查二次审核为标准统计AI最终漏检。同时满足以下条件：
                      <br />
                      人工判实废、AI判误废、图像核查二次审核判实废
                    </div>
                  }
                >
                  <QuestionCircleOutlined />
                </Tooltip>
                审核实废
              </span>
            ),
            key: '审核实废',
            dataIndex: 'leak_normal_fake_img',
            render: (text) => <span>{Number(text).toFixed(1)}</span>,
          },
          {
            title: (
              <span>
                <Tooltip
                  title={
                    <div>
                      以图像核查二次审核为标准统计图核人工判为实废的图像中误判部分。同时满足以下条件：
                      <br />
                      人工判实废、AI判误废、图像核查二次审核判误废
                    </div>
                  }
                >
                  <QuestionCircleOutlined />
                </Tooltip>
                审核误废
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
        width: '80px',
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
                      以图像二次审核为标准统计人工最终漏检。同时满足以下条件：
                      <br />
                      人工判误废、AI判实废、图像二次判实废
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
            render: (text) => <span>{Number(text).toFixed(1)}</span>,
          },
          {
            title: (
              <span>
                <Tooltip
                  title={
                    <div>
                      以图像二次审核为标准统计AI最终误检。同时满足以下条件：
                      <br />
                      人工判误废、AI判实废、图像二次审核判误废
                    </div>
                  }
                >
                  <QuestionCircleOutlined />
                </Tooltip>
                审核误废
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
        width: '80px',
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
    title: '图片总数',
    key: '图片总数',
    dataIndex: 'total_img',
    render: (text) => <span>{Number(text).toFixed(1)}</span>,
  },
  {
    title: '准确率',
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
                  以图像二次审核为标准计算AI判废系统最终判废准确率。
                  <br />
                  AI判废准确率 = 100-(AI漏检+AI误判)*100/(总条数-不计废)
                </div>
              }
            >
              <QuestionCircleOutlined />
            </Tooltip>
            二次审核
          </span>
        ),
        key: '二次审核',
        dataIndex: 'acc_fix',
        render: (text) => <span>{Number(text).toFixed(2)}%</span>,
      },
    ],
  },
  {
    title: 'OCR多取出',
    children: [
      {
        title: (
          <span>
            AI 实废
            <br />
            人工误废
          </span>
        ),
        key: 'AI实废+人工误废',
        dataIndex: 'ocr_human_leak_img',
        render: (text) => <span>{Number(text).toFixed(1)}</span>,
      },
      {
        title: (
          <span>
            AI 误废
            <br />
            人工误废
          </span>
        ),
        key: 'AI、人工同时误废',
        dataIndex: 'ocr_ai_human_leak_img',
        render: (text) => <span>{Number(text).toFixed(1)}</span>,
      },
    ],
  },
  // {
  //   title: '开包量',
  //   children: [
  //     {
  //       title: '图核判废',
  //       key: '图核判废',
  //       dataIndex: 'opennum',
  //     },
  //     {
  //       title: '二次审核',
  //       key: '二次审核',
  //       dataIndex: 'opennum_combine',
  //     },
  //   ],
  // },
];

export default () => {
  const [state, setState] = useState({
    tstart: '',
    tend: '',
  });

  useEffect(() => {
    db.getCartsDateRange().then(setState);
  }, []);

  const { data, loading } = useFetch({
    valid: () => /\d{8}/.test(state.tstart),
    param: {
      url: DEV ? '@/mock/1430_d55a6e3d81.json' : '/1430/d55a6e3d81.json',
      params: {
        ...state,
      },
    },
    callback: (res: IAxiosState<ICartItem>) =>
      res.data.map((item, i) => ({
        ...item,
        idx: i || '',
        acc: Number(item.acc),
      })),
  });

  const [show, setShow] = useState(false);
  const [cartinfo, setCartinfo] = useState({
    cartnumber: '',
    id: '0',
  });

  const [size, setSize] = useState(25);

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
            width: '160px',
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
                    }?cart=${record.cart}`}
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
