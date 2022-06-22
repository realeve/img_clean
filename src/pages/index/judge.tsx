import styles from './judge.less';
import { Row, Col, Divider, Button, Modal, message } from 'antd';
import { imageHost } from '@/utils/setting';

import { IImageItem, setImageJudge } from './db';

import { useState, useEffect } from 'react';

import * as R from 'ramda';

import { fetchXML, IBoxItem } from './lib';

import { originSize, defaultImageSize } from './Head';

import { connect } from 'dva';
import { ICommon } from '@/models/common';

import { RightOutlined, LeftOutlined } from '@ant-design/icons';

// import Animate from 'rc-animate';

// import LazyLoad from 'react-lazyload';

const confirm = Modal.confirm;

// TODO: lazyload
export const ImageItem = ({
  item,
  onChange,
  showModel = true,
  imgHeight = defaultImageSize,
  onHardSample,
  light = false,
}: {
  item: IImageItem;
  imgHeight: number;
  onChange: () => void;
  showModel?: boolean;
  onHardSample: () => void;
  light?: boolean;
}) => {
  const [box, setBox] = useState<IBoxItem | null>(null);
  useEffect(() => {
    if (!item) {
      return;
    }
    let unmounted = true;
    fetchXML(item.img_url).then((res) => {
      unmounted && setBox(res);
    });
    return () => {
      unmounted = false;
    };
  }, [item]);

  const scale = imgHeight / originSize;

  const [hover, setHover] = useState(false);

  return (
    <div
      className={styles.imageItem}
      title="点击改变状态"
      style={{
        height: imgHeight,
        // width: (showModel || hover ? 2 : 1) * imgHeight,
      }}
    >
      {!showModel && (
        <div
          className={styles.act}
          // style={{ left: imgHeight - 30 }}
          // onMouseEnter={() => {
          //   setHover(true);
          // }}
          // onMouseLeave={() => {
          //   setHover(false);
          // }}
          onClick={() => {
            setHover(!hover);
          }}
        >
          <RightOutlined
            style={{
              transform: `rotate(${hover ? 180 : 0}deg)`,
              transition: 'ease-in-out transform 0.5s',
            }}
          />
        </div>
      )}
      <div className={styles.difficult}>
        <Button type="ghost" onClick={onHardSample}>
          难
        </Button>
      </div>
      {/* <Animate key="0" transitionName="fade" transitionAppear> */}
      <div
        className={styles.detail}
        style={{ height: imgHeight, filter: `brightness(${light ? 2 : 1})` }}
        onClick={() => {
          onChange();
        }}
      >
        <img src={`${imageHost}${item.img_url}`} className={styles.img} />
        {box && (
          <div
            className={styles.box}
            style={{
              left: scale * box.x1,
              top: scale * box.y1,
              width: scale * (box.x2 - box.x1),
              height: scale * (box.y2 - box.y1),
            }}
          />
        )}
        {box && (
          <div
            className={styles.box2}
            style={{
              left: scale * (box.x1 + 112),
              top: scale * box.y1,
              width: scale * (box.x2 - box.x1),
              height: scale * (box.y2 - box.y1),
            }}
          />
        )}
        <div className={styles.spot}>{item.imageIdx}</div>
      </div>
      {/* </Animate> */}
    </div>
  );
};

export interface IJudgeData {
  fake: number[];
  normal: number[];
}

const JudgePage = ({
  data,
  judgeType,
  onRefresh,
  ip,
  imgHeight,
  setJudgeData,
  judgeData,
  showModel = false,
  isCheckPage = false,
  light = false,
}: {
  data: IImageItem[];
  judgeType: '0' | '1';
  onRefresh: () => void;
  imgHeight: number;
  ip: string;
  setJudgeData: (e: IJudgeData) => void;
  judgeData: IJudgeData;
  showModel?: boolean;
  isCheckPage?: boolean;
  light?: boolean;
}) => {
  const needReverse = !isCheckPage && judgeType == '1';

  const [rightSide, setRightSide] = useState(true);
  useEffect(() => {
    let item = parseInt(window.localStorage.getItem('rightSide') || '0');
    setRightSide(Boolean(item));
  }, []);

  const submit = async () => {
    let success1 =
      (needReverse ? judgeData.normal : judgeData.fake).length == 0
        ? true
        : await setImageJudge(
            {
              ip,
              audit_flag: 1,
              _id: needReverse ? judgeData.normal : judgeData.fake,
            },
            isCheckPage,
          );
    let success2 =
      (needReverse ? judgeData.fake : judgeData.normal).length == 0
        ? true
        : await setImageJudge(
            {
              ip,
              audit_flag: 0,
              _id: needReverse ? judgeData.fake : judgeData.normal,
            },
            isCheckPage,
          );
    if (!success1 && !success2) {
      message.error('数据提交失败，请稍后重试');
      return;
    }
    message.success('数据提交成功');
    onRefresh();
  };

  const fakeWidth = judgeType == '1' && !rightSide ? 8 : 16;

  const removeFake = (i: number, id: number) => {
    const fake = R.remove(i, 1, judgeData.fake);
    const normal = R.append(id, judgeData.normal);
    setJudgeData({
      fake,
      normal,
    });
  };

  const removeNormal = (i: number, id: number) => {
    const normal = R.remove(i, 1, judgeData.normal);
    const fake = R.append(id, judgeData.fake);
    setJudgeData({
      fake,
      normal,
    });
  };

  return (
    <Row gutter={16} style={{ position: 'relative' }}>
      <Divider />
      <Button
        size="large"
        type="primary"
        onClick={() => {
          confirm({
            onOk: () => {
              submit();
            },
            title: '是否所有数据已经判废完成，确认提交？',
            okText: '提交入库',
            cancelText: '取消',
          });
        }}
        style={{ position: 'absolute', top: 35, right: 5, zIndex: 10 }}
      >
        确认提交
      </Button>
      <Col span={fakeWidth}>
        <h1 className={styles.center}>
          实废（
          {judgeData[needReverse ? 'normal' : 'fake'].length}）
        </h1>
        <div className={styles.center}>请点击下方你认为是误废的产品</div>
      </Col>
      <Col span={24 - fakeWidth} style={{ borderLeft: '9px solid #888' }}>
        <Button
          type="default"
          onClick={() => {
            let normal = R.clone(judgeData['normal']);
            let fake = R.clone(judgeData['fake']);
            setJudgeData({
              normal: fake,
              fake: normal,
            });
          }}
        >
          交换数据
        </Button>

        <div>
          <h1 className={styles.center}>
            误废（
            {judgeData[needReverse ? 'fake' : 'normal'].length}）
          </h1>
        </div>
        <div className={styles.center}>请点击下方你认为是废票的产品</div>
      </Col>
      <Row>
        <Col span={fakeWidth}>
          <div className={styles.list}>
            {judgeData[needReverse ? 'normal' : 'fake'].map((id, i) => {
              const item = data.find((item) => item.id === id) as IImageItem;
              if (!item) {
                return null;
              }
              return (
                // <LazyLoad height={imgHeight}>
                <ImageItem
                  item={item}
                  key={id}
                  onChange={() => {
                    if (!needReverse) {
                      removeFake(i, id);
                    } else {
                      removeNormal(i, id);
                    }
                  }}
                  light={light}
                  showModel={showModel}
                  imgHeight={imgHeight}
                  onHardSample={() => {
                    setImageJudge(
                      {
                        ip,
                        audit_flag: judgeType == '0' ? 2 : 3,
                        _id: [id],
                      },
                      isCheckPage,
                    ).then((success) => {
                      if (!success) {
                        return;
                      }
                      const fake = R.remove(i, 1, judgeData.fake);
                      setJudgeData({
                        fake,
                        normal: judgeData.normal,
                      });
                    });
                  }}
                />
                // </LazyLoad>
              );
            })}
          </div>
          {/* {judgeType == '1' && (
            <Button
              size="large"
              type="primary"
              onClick={() => {
                confirm({
                  onOk: () => {
                    submit();
                  },
                  title: '是否所有数据已经判废完成，确认提交？',
                  okText: '提交入库',
                  cancelText: '取消',
                });
              }}
              style={{ marginTop: 10, zIndex: 10 }}
            >
              确认提交
            </Button>
          )}
          {judgeType == '1' && isCheckPage && (
            <Button
              size="large"
              onClick={onRefresh}
              style={{ marginTop: 10, marginLeft: 20, zIndex: 10 }}
            >
              下一页
            </Button>
          )} */}
        </Col>
        <Col
          span={24 - fakeWidth}
          style={{
            borderLeft: '9px solid #888',
          }}
        >
          <div className={styles.list}>
            {judgeData[needReverse ? 'fake' : 'normal'].map((id, i) => {
              const item = data.find((item) => item.id === id) as IImageItem;
              if (!item) {
                return null;
              }
              return (
                // <LazyLoad height={imgHeight}>
                <ImageItem
                  item={item}
                  key={id}
                  light={light}
                  showModel={showModel}
                  onChange={() => {
                    if (needReverse) {
                      removeFake(i, id);
                    } else {
                      removeNormal(i, id);
                    }
                  }}
                  imgHeight={imgHeight}
                  onHardSample={() => {
                    setImageJudge(
                      {
                        ip,
                        audit_flag: judgeType == '0' ? 2 : 3,
                        _id: [id],
                      },
                      isCheckPage,
                    ).then((success) => {
                      if (!success) {
                        return;
                      }
                      const normal = R.remove(i, 1, judgeData.normal);
                      setJudgeData({
                        normal,
                        fake: judgeData.fake,
                      });
                    });
                  }}
                />
                // </LazyLoad>
              );
            })}
          </div>
          <Divider />

          <Button
            size="large"
            type="primary"
            onClick={() => {
              confirm({
                onOk: () => {
                  submit();
                },
                title: '是否所有数据已经判废完成，确认提交？',
                okText: '提交入库',
                cancelText: '取消',
              });
            }}
            style={{ marginTop: 10, marginLeft: 10, zIndex: 10 }}
          >
            确认提交
          </Button>

          {isCheckPage && (
            <Button
              size="large"
              onClick={onRefresh}
              style={{ marginTop: 10, marginLeft: 20, zIndex: 10 }}
            >
              下一页
            </Button>
          )}
        </Col>
      </Row>
    </Row>
  );
};

export default connect(({ common }: { common: ICommon }) => ({
  showModel: common.showModel,
  ip: common.ip,
  imgHeight: common.imgHeight,
  light: common.light,
}))(JudgePage);
