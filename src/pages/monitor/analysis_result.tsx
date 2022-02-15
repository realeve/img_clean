import { useState } from 'react';
import { Button, Table } from 'antd';
import { ICartItem } from './db';
import ResultPanel from './ResultPanel';
import useFetch from '@/component/hooks/useFetch';
import { DEV, IAxiosState } from '@/utils/axios';
import { columns as tableColumns } from './index';

const columns = [
  ...tableColumns,
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
