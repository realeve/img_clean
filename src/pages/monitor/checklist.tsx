import React, { useState, useEffect, ReactNode } from 'react';
import useFetch from '@/component/hooks/useFetch';
import { Skeleton, Empty, Button } from 'antd';
import { Link } from 'umi';
import styles from './checklist.less';
import * as lib from '@/utils/lib';
import * as R from 'ramda';

interface ICheckList {
  match: {
    params: {
      cart: string;
    };
  };
}

const HeadLine = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <div className={styles.line}>
      <div className={styles.title}>{title}</div>
      <span>{children}</span>
    </div>
  );
};

const PageHeader = ({
  cart,
  picNum,
  onComplete,
}: {
  cart: string;
  picNum: number;
  onComplete: (e: string) => void;
}) => {
  const { data, loading } = useFetch({
    param: {
      url: '1445/186285a6ce',
      params: { cart },
    },
    callback: (e) => {
      if (e && e.data[0]) {
        onComplete(e.data[0].head);
      }
      return e;
    },
  });

  if (data && data.rows == 0) {
    return null;
  }

  return (
    <Skeleton loading={loading}>
      <div className={styles.header}>
        <div className={styles.mainTitle}>AI判废补充剔废单</div>
        {data && (
          <div className={styles.wideLine}>
            <HeadLine title="图像判废时间">{data.data[0].judge_date}</HeadLine>
            <HeadLine title="AI判废时间">{data.data[0].rec_date}</HeadLine>
          </div>
        )}
        <div className={styles.wideLine}>
          <HeadLine title="打印时间">{lib.now()}</HeadLine>
          <HeadLine title="票面开数">{picNum}</HeadLine>
        </div>
        <div className={styles.wideLine}>
          <HeadLine title="车号">{cart}</HeadLine>
          {data && <HeadLine title="冠号">{data.data[0].head}</HeadLine>}
        </div>
      </div>
    </Skeleton>
  );
};

let a = {
  format_pos: '10',
  gz: 'C88W54',
  kilo: '0',
  hundred: '110',
  client_no: '104',
};

const KiloContent = ({
  data,
  kilo,
  head,
}: {
  data: IFakeItem[];
  kilo: string;
  head: string;
}) => {
  return (
    <div className={styles.kilopage}>
      <div className={styles.header}>
        <span>冠字：{head}</span>
        <span>第 {kilo} 千</span>
        <span>小计：{data.length}</span>
      </div>
      <div className={styles.checkuser}>
        <div className={styles.item}>剔废人</div>
        <div className={styles.item}></div>
        <div className={styles.item}>剔废总计</div>
        <div className={styles.item}></div>
      </div>
      <table className={styles.content}>
        <thead>
          <tr>
            <td>序号</td>
            <td>开位</td>
            <td>冠号</td>
            <td>百位</td>
            <td>描述</td>
            <td>剔废</td>
          </tr>
        </thead>
        <tbody>
          {data.map((tr, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>[{tr.format_pos.padStart(2, '0')}开]</td>
              <td>{tr.gz}</td>
              <td>{tr.hundred}</td>
              <td>{tr.desc}</td>
              <td> </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
const PageContent = ({ data, head }: { data: IFakeItem[]; head: string }) => {
  let list = R.groupBy(R.prop('kilo'), data);
  console.log(list);
  return Object.keys(list).map((kilo) => (
    <KiloContent head={head} key={kilo} data={list[kilo]} kilo={kilo} />
  ));
};

interface IFakeItem {
  format_pos: string;
  gz: string;
  kilo: string;
  hundred: string;
  client_no: string;
  desc: string;
}
const CheckList = ({
  match: {
    params: { cart },
  },
}: ICheckList) => {
  const [head, setHead] = useState('');
  const { data, loading } = useFetch<IFakeItem>({
    param: {
      url: '1444/4c99b981d8',
      params: { cart },
    },
    callback: (e) => {
      if (!e) {
        return e;
      }
      let data = R.clone(e.data) as IFakeItem[];
      data = data.map((item) => {
        let client = item.client_no.slice(0, 2);
        item.desc = '';

        switch (client) {
          case '10':
            item.desc = 'Z';
            break;
          case '15':
            item.desc = 'S';
            break;
          case '14':
          case '16':
          case '17':
            item.desc = 'B';
        }

        return item;
      });
      return {
        ...e,
        data,
      };
    },
  });

  return (
    <Skeleton loading={loading}>
      {data && data.rows == 0 && (
        <Empty
          style={{ marginTop: 30 }}
          description="当前大万产品无需要追加打印的数据，请确认是否完成判废"
        >
          <Button type="primary">
            <Link to="/monitor/judge" style={{ color: '#fff' }}>
              {' '}
              前往判废页面
            </Link>
          </Button>
        </Empty>
      )}
      {data && data.rows > 0 && (
        <div className={styles.checklist}>
          <PageHeader cart={cart} picNum={data.rows} onComplete={setHead} />
          <PageContent data={data.data} head={head} />
        </div>
      )}
    </Skeleton>
  );
};

export default CheckList;
