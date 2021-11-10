import { Skeleton, Radio } from 'antd';
import { DEV } from '@/utils/setting';
import useFetch, { IFetchState } from '@/component/hooks/useFetch';
import * as db from './db';
import { IImageItem } from './db';

import { useState, useEffect } from 'react';
import styles from './index.less';
import JudgePage from './judge';
import { connect } from 'dva';
import { ICommon } from '@/models/common';

type TTaskNum = { manual_flag: number; img_num: number };

function IndexPage({ ip }) {
  const { data, loading, reFetch } = useFetch<TTaskNum>({
    param: {
      url: DEV ? '@/mock/1392_70919f0f45.json' : '/1392/70919f0f45.json',
    },
    callback: (e) => {
      const data = { fake: 0, normal: 0 };
      e.data.forEach((item: TTaskNum) => {
        if (item.manual_flag == 1) {
          data.fake = item.img_num;
        } else if (item.manual_flag == 0) {
          data.normal = item.img_num;
        }
      });
      return data;
    },
  });

  /**
   *   useFetch (React hooks)
   *   @database: { 生产指挥中心BI数据 }
   *   @desc:     { 我的判废数量 }
   *   useFetch 返回值说明： data(返回数据), error(报错), loading(加载状态), reFetch(强制刷新),setData(强制设定数据)
   */
  const { data: judgeNum, loading: judgeLoading } = useFetch<{
    fake: number;
    normal: number;
  }>({
    param: {
      url: `/1394/2f1cbb3ffe.json`,
      params: {
        ip,
      },
    },
    valid: () => ip.length > 0,
    callback: (e) => e.data?.[0] || { fake: 0, normal: 0 },
  });

  const [judgeType, setJudgeType] = useState<'0' | '1'>('0');

  const [imgs, setImgs] = useState<IImageItem[]>([]);

  const [dataLoading, setDataLoading] = useState(true);
  const refeshData = () => {
    setDataLoading(true);
    setImgs([]);
    db.getImgs(judgeType).then((res) => {
      setImgs(res);
      setDataLoading(false);
    });
  };
  useEffect(refeshData, []);

  return (
    <div className="card-content">
      <div className={styles.head}>
        <div className={styles.main}>
          <div className={styles.item}>
            <div style={{ width: 200 }}>待判废数据：</div>
            <Skeleton
              title={false}
              active
              loading={loading}
              paragraph={{ rows: 1, width: 300 }}
            >
              {data && `实废：${data.fake}, 误废：${data.normal}`}
            </Skeleton>
          </div>
          <div className={styles.item}>
            <div style={{ width: 200 }}>{ip} 已判废:</div>
            <Skeleton
              title={false}
              active
              loading={judgeLoading}
              paragraph={{ rows: 1, width: 300 }}
            >
              {judgeNum && `实废：${judgeNum.fake}, 误废：${judgeNum.normal}`}
            </Skeleton>
          </div>
        </div>
        <div className={styles.action}>
          <Radio.Group
            defaultValue="1"
            value={judgeType}
            buttonStyle="solid"
            onChange={(e) => {
              setJudgeType(e.target.value);
            }}
          >
            <Radio.Button value="1">加载实废</Radio.Button>
            <Radio.Button value="0">加载误废</Radio.Button>
          </Radio.Group>
        </div>
      </div>
      <JudgePage
        loading={dataLoading}
        judgeType={judgeType}
        data={imgs}
        onRefresh={() => {
          refeshData();
          reFetch();
        }}
        ip={ip}
      />
    </div>
  );
}

export default connect(({ common }: { common: ICommon }) => ({
  ip: common.ip,
}))(IndexPage);
