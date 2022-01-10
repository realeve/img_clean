import React, { useState, useEffect, useRef } from 'react';
import * as db from './db';
import { IJudgeImageItem } from './db';
import styles from './judge.less';
import { Skeleton, Row, Col, Button } from 'antd';

import ImageSize from '@/component/ImageSize';
import { connect } from 'dva';
import { ICommon } from '@/models/common';

import { forwardRef, useImperativeHandle } from 'react';

const Header = forwardRef((_, ref) => {
  const [taskList, setTaskList] = useState({ human_leak: '0', ai_leak: '0' });
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    await db.getImageCount().then(setTaskList);
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);

  useImperativeHandle(ref, () => ({
    refresh,
  }));

  return (
    <div className="head">
      <div className={styles.item}>
        <div style={{ width: 200 }}>待判废数据：</div>
        <Skeleton
          title={false}
          active
          loading={loading}
          paragraph={{ rows: 1, width: 300 }}
        >
          实废：{taskList.ai_leak}, 误废：{taskList.human_leak}
        </Skeleton>
      </div>
      <ImageSize />
    </div>
  );
});

const ImageItem = ({ data }: { data: IJudgeImageItem }) => {
  return (
    <li className={styles.imgItem}>
      <img src={data.image} />
      <div className={styles.dot}>{data.probability}%</div>
      <div className={styles.dotLeft}>{data.id}</div>
    </li>
  );
};

const ImageList = ({ data }: { data: IJudgeImageItem[] }) => {
  return (
    <ul className={styles.imgList}>
      {data.map((item) => (
        <ImageItem data={item} key={item.id} />
      ))}
    </ul>
  );
};

const fakeWidth = 14;
interface IJudgePageProps {
  imgHeight: number;
  ip: string;
  onRefresh: () => void;
}
const JudgeComponent = ({ imgHeight, ip, onRefresh }: IJudgePageProps) => {
  const [taskList, setTaskList] = useState<{
    fake: IJudgeImageItem[];
    normal: IJudgeImageItem[];
  }>({
    fake: [],
    normal: [],
  });

  const refresh = async () => {
    if (ip == '') {
      return;
    }
    await db.getImagesNeedJudge(ip).then((fake) => {
      setTaskList({ fake, normal: [] });
    });
  };
  useEffect(() => {
    refresh();
  }, []);

  const submit = async () => {
    refresh();
  };

  return (
    <Row style={{ marginTop: 20 }} className={styles.judgePage}>
      <Col
        span={fakeWidth}
        className={styles.rightLine}
        style={{ textAlign: 'center' }}
      >
        <h3>实废</h3>
        <p>(点击你认为是误废的图像)</p>
      </Col>
      <Col span={24 - fakeWidth} style={{ textAlign: 'center' }}>
        <h3>误废</h3>
        <p>（点击你认为是实废的图像）</p>
      </Col>

      <Col span={fakeWidth} className={styles.rightLine}>
        <ImageList data={taskList.fake} />
      </Col>
      <Col span={24 - fakeWidth}>
        <Button
          type="primary"
          onClick={submit}
          style={{ margin: '20px 0 0 20px' }}
        >
          提交
        </Button>
      </Col>
    </Row>
  );
};

const Judge = connect(({ common }: { common: ICommon }) => ({
  ip: common.ip,
  imgHeight: common.imgHeight,
}))(JudgeComponent);

export default () => {
  const ref = useRef(null);
  const onRefresh = () => {
    ref?.current?.refresh?.();
  };
  return (
    <div className="card-content">
      <Header ref={ref} />
      <Judge onRefresh={onRefresh} />
    </div>
  );
};
