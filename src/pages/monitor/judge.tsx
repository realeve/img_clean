import React, { useState, useEffect, useRef } from 'react';
import * as db from './db';
import { IJudgeImageItem } from './db';
import styles from './judge.less';
import { Skeleton, Row, Col, Button, message, Switch } from 'antd';

import ImageSize from '@/component/ImageSize';
import { connect } from 'dva';
import { ICommon } from '@/models/common';

import { forwardRef, useImperativeHandle } from 'react';
import * as R from 'ramda';

const Header = forwardRef(
  ({ ip, cart }: { ip: string; cart: string | undefined }, ref) => {
    const [taskList, setTaskList] = useState({ human_leak: '0', ai_leak: '0' });
    const [loading, setLoading] = useState(false);
    const [state, setState] = useState({
      total: '0',
      ai: '0',
      human: '0',
    });
    const refresh = async () => {
      setLoading(true);
      await db.getImageCount(ip, cart).then((res) => {
        setTaskList(res);
        let total = Number(res.ai_leak) + Number(res.human_leak);
        if (total == 0 && cart) {
          db.updateCarts(cart);
        }
      });
      await db.getJudgeResult(ip, cart).then(setState);
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
          <Skeleton
            title={false}
            active
            loading={loading}
            paragraph={{ rows: 1, width: 300 }}
          >
            <span style={{ width: 200, fontWeight: 'bold' }}>
              {cart} 待判废数据：
            </span>
            实废：{taskList.ai_leak}, 误废：{taskList.human_leak}
          </Skeleton>
        </div>
        <div className={styles.item}>
          <Skeleton
            title={false}
            active
            loading={loading}
            paragraph={{ rows: 1, width: 300 }}
          >
            <span style={{ width: 200, fontWeight: 'bold' }}>
              {cart} 已判废结果：
            </span>
            与人工保持一致：{state.human}, 与AI保持一致：{state.ai}，总数：
            {state.total}
          </Skeleton>
        </div>
        <ImageSize />
      </div>
    );
  },
);

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
  cart: string | undefined;
}
const JudgeComponent = ({
  imgHeight,
  ip,
  onRefresh,
  cart,
}: IJudgePageProps) => {
  const [rightSide, setRightSide] = useState(true);
  const [taskList, setTaskList] = useState<{
    fake: IJudgeImageItem[];
    normal: IJudgeImageItem[];
  }>({
    fake: [],
    normal: [],
  });

  useEffect(() => {
    let item = parseInt(window.localStorage.getItem('rightSide') || '0');
    setRightSide(Boolean(item));
  }, []);

  const refresh = () => {
    db.getImagesNeedJudge(ip, cart).then((fake: IJudgeImageItem[]) => {
      if (!rightSide) {
        setTaskList({ fake, normal: [] });
      } else {
        setTaskList({ fake: [], normal: fake });
      }
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
  }, [ip, cart]);

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
    onRefresh();
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
      <Col span={24}>
        <div>
          数据初始载入：
          <Switch
            onChange={(e) => {
              setRightSide(e);
              window.localStorage.setItem('rightSide', e ? '1' : '0');
            }}
            checked={rightSide}
            unCheckedChildren="左侧"
            checkedChildren="右侧"
          />
        </div>
      </Col>
      <Col
        span={!rightSide ? fakeWidth : 24 - fakeWidth}
        className={styles.rightLine}
        style={{ textAlign: 'center' }}
      >
        <h3>实废({taskList.fake.length})</h3>
        <p>(点击你认为是误废的图像)</p>
      </Col>
      <Col
        span={rightSide ? fakeWidth : 24 - fakeWidth}
        style={{ textAlign: 'center' }}
      >
        <h3>误废({taskList.normal.length})</h3>
        <p>（点击你认为是实废的图像）</p>
        <Button
          type="default"
          onClick={() => {
            let normal = R.clone(taskList['normal']);
            let fake = R.clone(taskList['fake']);
            setTaskList({
              normal: fake,
              fake: normal,
            });
          }}
        >
          交换数据
        </Button>
        <SubmitBtn />
      </Col>

      <Col
        span={!rightSide ? fakeWidth : 24 - fakeWidth}
        className={styles.rightLine}
      >
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
      <Col span={rightSide ? fakeWidth : 24 - fakeWidth}>
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
  imgHeight: common.imgHeight,
}))(JudgeComponent);

const JudgePage = ({
  ip,
  location: { query },
}: {
  ip: string;
  location: { query: {} };
}) => {
  const ref = useRef(null);
  const onRefresh = () => {
    ref?.current?.refresh?.();
  };
  return (
    <div className="card-content">
      <Header ip={ip} ref={ref} cart={query.cart} />
      <Judge ip={ip} onRefresh={onRefresh} cart={query.cart} />
    </div>
  );
};

export default connect(({ common }: { common: ICommon }) => ({
  ip: common.ip,
}))(JudgePage);
