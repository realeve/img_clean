import { Skeleton, Radio } from 'antd';
import { DEV } from '@/utils/setting';
import useFetch from '@/component/hooks/useFetch';
import * as db from './db';
import { IImageItem } from './db';

import { useState, useEffect } from 'react';
import styles from './index.less';
import JudgePage from './judge';

type TTaskNum = { manual_flag: number; img_num: number };

export default function IndexPage() {
  const { data, loading } = useFetch<TTaskNum>({
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

  const [judgeType, setJudgeType] = useState<'0' | '1'>('1');

  const [imgs, setImgs] = useState<IImageItem[]>([]);

  const [dataLoading, setDataLoading] = useState(true);
  const refeshData = () => {
    setDataLoading(true);
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
          <div style={{ width: 200 }}>待判废数据：</div>
          <Skeleton
            title={false}
            active
            loading={true || loading}
            paragraph={{ rows: 1, width: 300 }}
          >
            {data && `实废：${data.fake}, 误废：${data.normal}`}
          </Skeleton>
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
        onRefresh={refeshData}
      />
    </div>
  );
}
