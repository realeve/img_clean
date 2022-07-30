import React, { useState, useEffect } from 'react';
import { Tabs, Modal, Skeleton } from 'antd';
import * as db from './db';
import { IImageItem } from './db';
import styles from './ResultPanel.less';
import * as R from 'ramda';
import { connect } from 'umi';

import { ICommon } from '@/models/common';

const TabPane = Tabs.TabPane;

const titles = {
  fake: '共同检出',
  leak_human: 'AI误检/人工漏判',
  leak_ai: 'AI漏检',
  ocr: 'OCR多取出',
};

const initState = {
  leak_ai: [],
  leak_human: [],
  fake: [],
  ocr: [],
};

const ResultPanel = ({
  show,
  setShow,
  cartinfo,
  imgHeight,
}: {
  show: boolean;
  cartinfo: {
    cartnumber: string;
    id: string;
  };
  setShow: (e: boolean) => void;
  imgHeight: number;
}) => {
  const [state, setState] = useState<{
    fake: IImageItem[];
    leak_human: IImageItem[];
    leak_ai: IImageItem[];
    ocr: IImageItem[];
  }>(R.clone(initState));

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show || cartinfo.id == '0') {
      return;
    }
    setLoading(true);
    setState(R.clone(initState));
    db.getDetail(cartinfo.id)
      .then((res: IImageItem[]) => {
        const detail = {
          leak_ai: res
            .filter(
              (item) =>
                item.human_result > item.ai_result &&
                [null, '0'].includes(item.ocr_result),
            )
            .sort((b, a) => a.verify_result - b.verify_result),
          leak_human: res
            .filter(
              (item) =>
                item.human_result < item.ai_result &&
                [null, '0'].includes(item.ocr_result),
            )
            .sort((b, a) => a.verify_result - b.verify_result),
          fake: res.filter(
            (item) =>
              item.human_result == item.ai_result &&
              [null, '0'].includes(item.ocr_result),
          ),
          ocr: res
            .filter((item) => item.ocr_result == '1')
            .sort((b, a) => a.ai_result - b.ai_result),
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
      {['leak_ai', 'leak_human'].includes(tabKey) && (
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
                !['auto_lock_leak', 'auto_lock'].includes(a.verify_ip2),
            ).length
          }{' '}
          / 实废：
          {
            state[tabKey].filter(
              (a) =>
                a.verify_result2 == '1' &&
                !['auto_lock_leak', 'auto_lock'].includes(a.verify_ip2),
            ).length
          }{' '}
          / 不计废:
          {
            state[tabKey].filter((a) =>
              ['auto_lock_leak', 'auto_lock'].includes(a.verify_ip2),
            ).length
          }{' '}
          / 未审核：{state[tabKey].filter((a) => a.verify_ip2 == null).length}
        </div>
      )}
      {tabKey == 'ocr' && (
        <div className={styles.info}>
          人工漏判（AI实废）：
          {state[tabKey].filter((a) => a.ai_result == 1).length} /
          AI与人工同时漏判：
          {state[tabKey].filter((a) => a.ai_result == 0).length}
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
                  <li
                    key={subItem.id}
                    className="animated zoomIn"
                    style={{
                      width: imgHeight,
                      height:
                        cartinfo.cartnumber.substring(2, 4) == '75'
                          ? imgHeight
                          : (imgHeight * 10) / 16,
                    }}
                  >
                    <div className={styles.wrap}>
                      <img src={`${subItem.image}`} />
                    </div>
                    <div className={styles.dot}>{subItem.probability}%</div>
                    <div className={styles.dotLeft}>
                      {subItem.ex_codenum}
                      <br />
                      开位:
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
                    {subItem.ocr_result == '1' && (
                      <div
                        className={
                          subItem.ai_result == 0
                            ? styles.dotLeftFake
                            : styles.dotLeftNormal
                        }
                      >
                        {subItem.ai_result == 1 ? (
                          <span>人工漏判</span>
                        ) : (
                          '同时漏判'
                        )}
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

export default connect(({ common }: { common: ICommon }) => ({
  imgHeight: common.imgHeight,
}))(ResultPanel);
