import styles from './judge.less';
import { Row, Col, Divider, Radio, Button, Modal, message } from 'antd';
import { imageHost } from '@/utils/setting';

import { IImageItem, setImageJudge } from './db';

import { useState, useEffect } from 'react';

import { useSetState } from 'react-use';
import * as R from 'ramda';
import { fetchXML, IBoxItem } from './lib';

const defaultImageSize = 192;
const originSize = 112;
const imgSize = [112, 128, 192, 224, 256, 384];

const confirm = Modal.confirm;

const ImageItem = ({
  item,
  onChange,
  imgHeight = defaultImageSize,
  idx,
}: {
  item: IImageItem;
  imgHeight: number;
  onChange: () => void;
  idx: number;
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

  return (
    <div
      className={styles.imageItem}
      title="点击改变状态"
      onClick={() => {
        onChange();
      }}
      style={{ height: imgHeight }}
    >
      <div className={styles.detail} style={{ height: imgHeight }}>
        <img src={`${imageHost}${item.img_url}`} style={{ height: '100%' }} />
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
        <div className={styles.spot}>{idx}</div>
      </div>
    </div>
  );
};

export default ({
  data,
  judgeType,
  onRefresh,
  ip,
  loading = true,
}: {
  data: IImageItem[];
  judgeType: '0' | '1';
  onRefresh: () => void;
  loading?: boolean;
  ip: string;
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

  const [imgHeight, setImgHeight] = useState(defaultImageSize);

  const submit = async () => {
    let success1 = await setImageJudge({
      ip,
      audit_flag: 1,
      _id: judgeData.fake,
    });
    let success2 = await setImageJudge({
      ip,
      audit_flag: 0,
      _id: judgeData.normal,
    });
    if (!success1 || !success2) {
      message.error('数据提交失败，请稍后重试');
      return;
    }
    message.success('数据提交成功');
    onRefresh();
  };

  return (
    <Row gutter={16} style={{ marginTop: 20 }}>
      <Col span={12}>
        图片默认大小(像素)：
        <Radio.Group
          defaultValue={defaultImageSize}
          value={imgHeight}
          buttonStyle="solid"
          onChange={(e) => {
            setImgHeight(e.target.value);
          }}
        >
          {imgSize.map((item) => {
            return (
              <Radio.Button value={item} key={String(item)}>
                {item}
              </Radio.Button>
            );
          })}
        </Radio.Group>
      </Col>
      <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
        >
          确认提交
        </Button>
      </Col>
      <Divider />
      <Col span={12}>
        <h1 className={styles.center}>实废（{judgeData.fake.length}）</h1>
        <div className={styles.center}>请点击下方你认为是误废的产品</div>
      </Col>
      <Col span={12} style={{ borderLeft: '9px solid #888' }}>
        <h1 className={styles.center}>误废（{judgeData.normal.length}）</h1>
        <div className={styles.center}>请点击下方你认为是废票的产品</div>
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
                imgHeight={imgHeight}
                idx={i + 1}
              />
            );
          })}
        </div>
      </Col>
      <Col span={12} style={{ borderLeft: '9px solid #888' }}>
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
                imgHeight={imgHeight}
                idx={i + 1}
              />
            );
          })}
        </div>
      </Col>
    </Row>
  );
};
