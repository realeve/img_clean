import React, { useState, ReactNode, useEffect } from 'react';
import useFetch from '@/component/hooks/useFetch';
import { Skeleton, Empty, Button } from 'antd';
import { Link } from 'umi';
import styles from './checklist.less';
import * as lib from '@/utils/lib';
import * as R from 'ramda';
import { useTitle } from 'react-use';
import { IFakeItem, handleData } from './lib';

interface ICheckList {
  location: { query: { cart: string } };
}

const NEED_PRINT = true;

const HeadLine = ({
  title,
  children,
  style = {},
}: {
  title: string;
  children: ReactNode;
  style: React.CSSProperties;
}) => {
  return (
    <div className={styles.line} style={style}>
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
        {/* {data && (
          <div className={styles.wideLine}>
            <HeadLine title="图核判废">{data.data[0].judge_date}</HeadLine>
            <HeadLine title="AI判废">{data.data[0].rec_date}</HeadLine>
          </div>
        )} */}
        <div className={styles.wideLine}>
          <HeadLine title="打印时间" style={{ flex: 1.3 }}>
            {lib.now()}
          </HeadLine>
          <HeadLine title="票面开数">{picNum}</HeadLine>
        </div>
        <div className={styles.wideLine}>
          <HeadLine title="车号" style={{ flex: 1.3 }}>
            {cart}
          </HeadLine>
          {data && <HeadLine title="冠号">{data.data[0].head}</HeadLine>}
        </div>
      </div>
    </Skeleton>
  );
};

const KiloContent = ({
  data,
  kilo,
  head,
}: {
  data: IFakeItem[];
  kilo: number;
  head: string;
}) => {
  const TableHeader = ({ kilo = false }: { kilo?: string | boolean }) => (
    <>
      <tr>
        <td>序号</td>
        <td>开位</td>
        <td>冠号</td>
        <td>百位</td>
        <td>描述</td>
        <td>剔废</td>
      </tr>
      {kilo && <div className={styles.appendKilo}>第 {kilo} 千</div>}
    </>
  );
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
        <tbody>
          <TableHeader />
          {data.map((tr, idx) => (
            <>
              <tr key={idx}>
                <td>
                  {/* {tr.index} */}
                  {idx + 1}
                </td>
                <td>[{tr.format_pos.padStart(2, '0')}开]</td>
                <td>{tr.gz}</td>
                <td>{tr.hundred}</td>
                <td>{tr.desc}</td>
                <td> </td>
              </tr>
              {tr.isEmpty && <TableHeader key={idx + 'empty'} kilo={tr.kilo} />}
              {tr.appendLine &&
                tr.appendLine.map((item) => (
                  <tr key={item + 'append'} style={{ border: 'none' }} />
                ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PageContent = ({
  data,
  hash,
  head,
}: {
  hash: string;
  data: IFakeItem[];
  head: string;
}) => {
  let list = R.groupBy(R.prop('kilo'), data);
  const [state, setState] = useState(false);
  useEffect(() => {
    if (!head || !hash) {
      return;
    }

    let timeid = window.setTimeout(() => {
      NEED_PRINT && window.print();
    }, 800);

    return () => {
      window.clearTimeout(timeid);
    };
  }, [hash, head]);

  console.log(state);
  return Object.keys(list).map((kilo) => (
    <KiloContent head={head} key={kilo} data={list[kilo]} kilo={Number(kilo)} />
  ));
};

const CheckList = ({
  location: {
    query: { cart },
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
      return handleData(e);
    },
  });

  useTitle(`AI判废补充剔废单          车号: ${cart}        冠号: ${head}`);

  return (
    <Skeleton loading={loading}>
      {data && data.rows == 0 && (
        <Empty
          style={{ marginTop: 30 }}
          description="当前大万产品无需要追加打印的数据，请确认是否完成判废"
        >
          <Button type="primary">
            <Link to="/monitor/judge" style={{ color: '#fff' }}>
              前往判废页面
            </Link>
          </Button>
        </Empty>
      )}
      {data && data.rows > 0 && (
        <div className={styles.checklist}>
          <Button
            type="primary"
            className={styles.noprint}
            onClick={() => {
              window.print();
            }}
          >
            打印号单
          </Button>
          <PageHeader cart={cart} picNum={data.rows} onComplete={setHead} />
          <PageContent data={data.data} hash={data.hash} head={head} />
        </div>
      )}
    </Skeleton>
  );
};

export default CheckList;
