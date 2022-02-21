import {
  Skeleton,
  Radio,
  Row,
  Col,
  Input,
  Button,
  message,
  Switch,
  Modal,
} from 'antd';

import styles from './label.less';

import { IAxiosState } from '@/utils/axios';

import { DEV } from '@/utils/setting';
import useFetch from '@/component/hooks/useFetch';

import { useState, useEffect } from 'react';

import { saveShowModel } from '@/pages/index/lib';

import * as db from './db';

import { forwardRef, useImperativeHandle } from 'react';

import { connect } from 'dva';
import { ICommon } from '@/models/common';
import { Dispatch } from 'redux';

import ImageSize from '@/component/ImageSize';

type TTaskNum = { img_num: number };

export const originSize = 112;

interface IHeadInterface {
  ip: string;
  showModel?: boolean;
  dispatch: Dispatch;
  imgHeight: number;
  refInstance?: any;
  judgeType: '0' | '1';
  curUser: string;
}

const Head = ({
  ip,
  showModel = false,
  dispatch,
  refInstance,
  curUser,
}: IHeadInterface) => {
  const {
    data: total_tasknum,
    loading,
    reFetch,
  } = useFetch<number>({
    param: {
      url: DEV ? '@/mock/1392_70919f0f45.json' : '/1466/a448c09eb5.json',
    },
    callback: (e: IAxiosState<TTaskNum>) => {
      return e.data[0].img_num;
    },
  });

  /**
   *   useFetch (React hooks)
   *   @database: { 生产指挥中心BI数据 }
   *   @desc:     { 我的判废数量 }
   *   useFetch 返回值说明： data(返回数据), error(报错), loading(加载状态), reFetch(强制刷新),setData(强制设定数据)
   */
  const {
    data: judgeNum,
    loading: judgeLoading,
    reFetch: refetchJudge,
  } = useFetch<{
    fake: number;
    normal: number;
  }>({
    param: {
      url: `/1467/d455febb3c.json`,
      params: {
        ip,
      },
    },
    valid: () => ip.length > 0,
    callback: (e) => e.data?.[0] || { img_num: 0 },
  });

  useImperativeHandle(refInstance, () => ({
    refresh: () => {
      refetchJudge();
      reFetch();
    },
  }));

  const [userInfoMode, setUserInfoMode] = useState<'add' | 'update'>('add');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (ip.length === 0) {
      return;
    }
    db.getImageJudgeUsers(ip).then((res) => {
      setUserInfoMode(!res ? 'add' : 'update');
      if (!res) {
        return;
      }
      setUserName(res.username);
    });
  }, [ip]);

  const [judgeUsers, setJudgeUsers] = useState<
    { id: number; ip: string; username: string }[]
  >([]);

  const [show, setShow] = useState(false);

  const [totalJudgeNum, setTotalJudgeNum] = useState<
    { username: string; fake_nums: number }[]
  >([]);

  useEffect(() => {
    db.getImageClass().then(setTotalJudgeNum);
    if (!window.location.href.includes('/main/result')) {
      return;
    }
    db.getImageJudgeUsersList().then(setJudgeUsers);
  }, []);

  const [light, setLight] = useState(false);

  return (
    <Row className={styles.head}>
      <Col span={18}>
        <div className={styles.main}>
          <div className={styles.item}>
            <div style={{ width: 200 }}>待分类数据：</div>
            <Skeleton
              title={false}
              active
              loading={loading}
              paragraph={{ rows: 1, width: 300 }}
            >
              {total_tasknum}
            </Skeleton>
          </div>
          <div className={styles.item}>
            <div style={{ width: 200 }}>{ip} 已分类:</div>
            <Skeleton
              title={false}
              active
              loading={judgeLoading}
              paragraph={{ rows: 1, width: 300 }}
            >
              {judgeNum?.img_num}
            </Skeleton>
          </div>
        </div>
      </Col>
      <Col span={6}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}
        >
          <div style={{ marginRight: 10 }}>
            图片增亮：
            <Switch
              checked={light}
              onChange={(e) => {
                setLight(e);
                dispatch({
                  type: 'common/setStore',
                  payload: {
                    light: e,
                  },
                });
              }}
            />
          </div>
        </div>
      </Col>
      <ImageSize />
      <Col className={styles.action} span={12}>
        <div>
          <div>本机IP地址：{ip}</div>
          <div>
            本机用户：
            <Input
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
              }}
              placeholder="请在此输入你的姓名"
              style={{ width: 160 }}
            />
            <Button
              type="default"
              onClick={() => {
                if (userName.length === 0) {
                  return;
                }
                db.udpateUserInfo(
                  { ip, username: userName },
                  userInfoMode,
                ).then((success) => {
                  message[success ? 'success' : 'error'](
                    `数据更新${success ? '成功' : '失败'}`,
                  );
                });
              }}
            >
              {userInfoMode == 'add' ? '添加' : '更新'}
            </Button>
          </div>
        </div>
      </Col>
      <Col span={12} style={{ marginTop: 10 }}>
        <div>
          显示模板图：
          <Switch
            checked={showModel}
            onChange={(e) => {
              saveShowModel(e);
              dispatch({
                type: 'common/setStore',
                payload: {
                  showModel: e,
                },
              });
            }}
          />
          <Button
            style={{ marginLeft: 20 }}
            type="dashed"
            onClick={() => {
              setShow(true);
            }}
          >
            分类总量统计
          </Button>
        </div>
      </Col>
      {judgeUsers.length > 0 && (
        <Col
          span={12}
          style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}
        >
          <div>
            查看分类人员：
            <Radio.Group
              defaultValue={0}
              value={curUser}
              buttonStyle="solid"
              onChange={(e) => {
                dispatch({
                  type: 'common/setStore',
                  payload: {
                    curUser: e.target.value,
                  },
                });
              }}
            >
              {judgeUsers.map((item) => {
                return (
                  <Radio.Button value={item.ip} key={String(item.id)}>
                    {item.username}
                  </Radio.Button>
                );
              })}
            </Radio.Group>
          </div>
        </Col>
      )}

      <Modal
        title="判废量汇总"
        visible={show}
        onCancel={() => {
          setShow(false);
        }}
        footer={null}
        bodyStyle={{ padding: '20px 0' }}
      >
        <ul style={{ listStyle: 'auto', lineHeight: '30px' }}>
          {totalJudgeNum.map((item) => (
            <li>
              <div style={{ display: 'flex' }}>
                <div style={{ width: 100 }}>
                  <b>{item.username}：</b>
                </div>
                {item.fake_nums}
              </div>
            </li>
          ))}
        </ul>
      </Modal>
    </Row>
  );
};

const HeadPage = connect(({ common }: { common: ICommon }) => ({
  showModel: common.showModel,
  ip: common.ip,
  curUser: common.curUser,
}))(Head);

export default forwardRef((props: IHeadInterface, ref) => (
  <HeadPage {...props} refInstance={ref} />
));
