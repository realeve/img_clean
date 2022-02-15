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
    title: '不计废',
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
