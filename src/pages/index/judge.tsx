import styles from './judge.less';
import { Row, Col, Button } from 'antd';
import { imageHost } from '@/utils/setting';

import { IImageItem } from './db';

import { useEffect } from 'react';

import { useSetState } from 'react-use';
import * as R from 'ramda';

const ImageItem = ({
  item,
  onChange,
}: {
  item: IImageItem;
  onChange: () => void;
}) => {
  return (
    <div
      className={styles.imageItem}
      title="点击改变状态"
      onClick={() => {
        onChange();
      }}
    >
      <img src={`${imageHost}${item.img_url}`} />
    </div>
  );
};

export default ({
  data,
  judgeType,
}: {
  data: IImageItem[];
  judgeType: '0' | '1';
}) => {
  const [judgeData, setJudgeData] = useSetState<{
    fake: number[];
    normal: number[];
  }>({
    fake: [],
    normal: [],
  });

  useEffect(() => {
    const ids = data.map((item) => item.id);
    setJudgeData({
      fake: judgeType === '1' ? ids : [],
      normal: judgeType === '0' ? ids : [],
    });
  }, [data]);

  return (
    <Row gutter={16}>
      <Col span={12}>
        <h2 style={{ textAlign: 'center' }}>实废（{judgeData.fake.length}）</h2>
      </Col>
      <Col span={12} style={{ borderLeft: '1px solid #bbb' }}>
        <h2 style={{ textAlign: 'center' }}>
          误废（{judgeData.normal.length}）
        </h2>
      </Col>
      <Col span={12}>
        <div className={styles.list}>
          {judgeData.fake.map((id, i) => {
            const item = data.find((item) => item.id === id) as IImageItem;
            return (
              <ImageItem
                item={item}
                key={id}
                onChange={() => {
                  const fake = R.remove(i, 1, judgeData.fake);
                  const normal = R.append(id, judgeData.normal);
                  setJudgeData({
                    fake,
                    normal,
                  });
                }}
              />
            );
          })}
        </div>
      </Col>
      <Col span={12} style={{ borderLeft: '1px solid #bbb' }}>
        <div className={styles.list}>
          {judgeData.normal.map((id, i) => {
            const item = data.find((item) => item.id === id) as IImageItem;
            return (
              <ImageItem
                item={item}
                key={id}
                onChange={() => {
                  const normal = R.remove(i, 1, judgeData.normal);
                  const fake = R.append(id, judgeData.fake);
                  setJudgeData({
                    fake,
                    normal,
                  });
                }}
              />
            );
          })}
        </div>
      </Col>
    </Row>
  );
};
