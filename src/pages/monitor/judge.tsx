import React, { useState, useEffect, useRef } from 'react';
import * as db from './db';
import { IJudgeImageItem } from './db';
import styles from './judge.less';
import { Skeleton, Row, Col, Button, message } from 'antd';

import ImageSize from '@/component/ImageSize';
import { connect } from 'dva';
import { ICommon } from '@/models/common';

import { forwardRef, useImperativeHandle } from 'react';
import * as R from 'ramda';

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

const ImageItem = ({
  data,
  imgHeight,
  onClick,
}: {
  data: IJudgeImageItem;
  imgHeight: number;
  onClick: () => void;
}) => {
  return (
    <li
      className={styles.imgItem}
      onClick={onClick}
      style={{ height: imgHeight, width: imgHeight }}
    >
      <img src={data.image} />
      <div className={styles.dot}>{data.probability}%</div>
      <div className={styles.dotLeft}>{data.img_order}</div>
    </li>
  );
};

const ImageList = ({
  data,
  imgHeight,
  onChange,
}: {
  data: IJudgeImageItem[];
  imgHeight: number;
  onChange: (e: number) => void;
}) => {
  return (
    <ul className={styles.imgList}>
      {data.map((item, idx) => (
        <ImageItem
          onClick={() => {
            onChange(idx);
          }}
          imgHeight={imgHeight}
          data={item}
          key={item.id}
        />
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

  const refresh = () => {
    db.getImagesNeedJudge(ip).then((fake: IJudgeImageItem[]) => {
      setTaskList({ fake, normal: [] });
      db.judgeImages({
        ip,
        verify_result: -1,
        _id: fake.map((item) => item.id),
      });
    });
  };
  useEffect(() => {
    if (ip == '') {
      return;
    }
    refresh();
  }, [ip]);

  const submit = async () => {
    let fake = await db.judgeImages({
      ip,
      verify_result: 1,
      _id: taskList.fake.map((item) => item.id),
    });
    let normal = await db.judgeImages({
      ip,
      verify_result: 0,
      _id: taskList.normal.map((item) => item.id),
    });
    if (!fake && !normal) {
      message.error('数据提交出错，请稍后重试');
      return;
    }
    message.success('数据提交成功');
    setTaskList({
      fake: [],
      normal: [],
    });
    refresh();
  };

  const SubmitBtn = ({ absolute = false }) => (
    <Button
      type="primary"
      onClick={submit}
      style={{
        margin: '20px 0 0 20px',
        ...(absolute ? { position: 'absolute', right: 20, top: 20 } : {}),
      }}
    >
      提交
    </Button>
  );

  return (
    <Row style={{ marginTop: 20 }} className={styles.judgePage}>
      <Col
        span={fakeWidth}
        className={styles.rightLine}
        style={{ textAlign: 'center' }}
      >
        <h3>实废({taskList.fake.length})</h3>
        <p>(点击你认为是误废的图像)</p>
      </Col>
      <Col span={24 - fakeWidth} style={{ textAlign: 'center' }}>
        <h3>误废({taskList.normal.length})</h3>
        <p>（点击你认为是实废的图像）</p>
        <SubmitBtn />
      </Col>

      <Col span={fakeWidth} className={styles.rightLine}>
        <ImageList
          onChange={(idx) => {
            let item = R.nth(idx)(taskList.fake) as IJudgeImageItem;
            let fake = R.remove(idx, 1, taskList.fake);
            let normal = R.append(item, taskList.normal);
            setTaskList({
              fake,
              normal,
            });
          }}
          data={taskList.fake}
          imgHeight={imgHeight}
        />
      </Col>
      <Col span={24 - fakeWidth}>
        <ImageList
          onChange={(idx) => {
            let item = R.nth(idx)(taskList.normal) as IJudgeImageItem;
            let normal = R.remove(idx, 1, taskList.normal);
            let fake = R.append(item, taskList.fake);
            setTaskList({
              fake,
              normal,
            });
          }}
          data={taskList.normal}
          imgHeight={imgHeight}
        />

        <SubmitBtn />
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
