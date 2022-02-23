import React, { useState, useEffect } from 'react';
import { Tabs, Modal, Skeleton } from 'antd';
import * as db from './db';
import { IImageItem } from './db';
import styles from './ResultPanel.less';
import * as R from 'ramda';
const TabPane = Tabs.TabPane;

const titles = {
  fake: '共同检出',
  leak_human: 'AI误检/人工漏判',
  leak_ai: 'AI漏检',
};
const initState = {
  leak_ai: [],
  leak_human: [],
  fake: [],
};

export default ({
  show,
  setShow,
  cartinfo,
}: {
  show: boolean;
  cartinfo: {
    cartnumber: string;
    id: string;
  };
  setShow: (e: boolean) => void;
}) => {
  const [state, setState] = useState<{
    fake: IImageItem[];
    leak_human: IImageItem[];
    leak_ai: IImageItem[];
  }>(R.clone(initState));

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show || cartinfo.id == '0') {
      return;
    }
    setLoading(true);
    setState(R.clone(initState));
    db.getDetail(cartinfo.id)
      .then((res) => {
        const detail = {
          leak_ai: res
            .filter((item) => item.human_result > item.ai_result)
            .sort((b, a) => a.verify_result - b.verify_result),
          leak_human: res
            .filter((item) => item.human_result < item.ai_result)
            .sort((b, a) => a.verify_result - b.verify_result),
          fake: res.filter((item) => item.human_result == item.ai_result),
        };
        setState(detail);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [cartinfo, show]);

  const [tabKey, setTabKey] = useState('leak_ai');
  return (
    <Modal
      bodyStyle={{ padding: '0 12px 12px 12px' }}
      title={`【${cartinfo.cartnumber}】AI与人工判废结果比对`}
      visible={show}
      onCancel={() => setShow(false)}
      footer={null}
      width={1210}
    >
      {tabKey != 'fake' && (
        <div className={styles.info}>
          二次审核 误废：
          {state[tabKey].filter((a) => a.verify_result == '0').length} / 实废：
          {state[tabKey].filter((a) => a.verify_result == '1').length}
          <br />
          实物审核 误废：
          {
            state[tabKey].filter(
              (a) =>
                a.verify_result2 == '0' &&
                ['auto_lock_leak', 'auto_lock'].includes(a.verify_ip2),
            ).length
          }{' '}
          / 实废：
          {
            state[tabKey].filter(
              (a) =>
                a.verify_result2 == '1' &&
                ['auto_lock_leak', 'auto_lock'].includes(a.verify_ip2),
            ).length
          }{' '}
          / 不计废:
          {
            state[tabKey].filter((a) =>
              ['auto_lock_leak', 'auto_lock'].includes(a.verify_ip2),
            ).length
          }
        </div>
      )}
      <Tabs defaultActiveKey={tabKey} accessKey={tabKey} onTabClick={setTabKey}>
        {Object.keys(state).map((item) => (
          <TabPane
            tab={
              <div>
                {titles[item]}({state[item].length})
              </div>
            }
            key={item}
          >
            <Skeleton active loading={loading}>
              <ul className={styles.panel}>
                {state[item].map((subItem: IImageItem) => (
                  <li key={subItem.id} className="animated zoomIn">
                    <div className={styles.wrap}>
                      <img src={`${subItem.image}`} />
                    </div>
                    <div className={styles.dot}>{subItem.probability}%</div>
                    <div className={styles.dotLeft}>
                      id:{subItem.id}, 号码:{subItem.ex_codenum}, 开位:
                      {subItem.format_pos}
                    </div>
                    {subItem.verify_result && (
                      <div
                        className={
                          subItem.verify_result == '1'
                            ? styles.dotRightFake
                            : styles.dotRightNormal
                        }
                      >
                        审核{subItem.verify_result == '1' ? '废' : '误'}
                      </div>
                    )}

                    {['0', '1'].includes(subItem.verify_result2) && (
                      <div
                        className={
                          subItem.verify_result2 == '1'
                            ? styles.dotLeftFake
                            : styles.dotLeftNormal
                        }
                      >
                        实物{subItem.verify_result2 == '1' ? '废' : '误'}
                        {['auto_lock_leak', 'auto_lock'].includes(
                          subItem.verify_ip2,
                        )
                          ? '(不计)'
                          : ''}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Skeleton>
          </TabPane>
        ))}
      </Tabs>
    </Modal>
  );
};
