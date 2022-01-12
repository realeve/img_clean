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
                    <div className={styles.dotLeft}>{subItem.id}</div>
                    {subItem.verify_result && (
                      <div
                        className={
                          subItem.verify_result == '1'
                            ? styles.dotRightFake
                            : styles.dotRightNormal
                        }
                      >
                        {subItem.verify_result == '1' ? '废' : '误'}
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
