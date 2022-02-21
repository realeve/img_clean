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

import { DEV } from '@/utils/setting';
import useFetch from '@/component/hooks/useFetch';

import { useState, useEffect, useRef } from 'react';

import { connect } from 'dva';
import { ICommon } from '@/models/common';
import { Dispatch } from 'redux';

import Header from './Head';
import * as db from './db';
import { IClassItem } from './db';
import { fetchXML, IBoxItem } from '@/pages/index/lib';

import { originSize, defaultImageSize } from '@/pages/index/Head';

// TODO: lazyload
export const ImageItem = ({
  item,
  onChange,
  imgHeight = defaultImageSize,
  light = false,
}: {
  item: IClassItem;
  imgHeight: number;
  onChange: () => void;
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

  return (
    <div
      className={styles.imageItem}
      title="点击改变状态"
      style={{
        height: imgHeight,
        width: imgHeight,
      }}
    >
      <div
        className={styles.detail}
        style={{ height: imgHeight, filter: `brightness(${light ? 2 : 1})` }}
        onClick={() => {
          onChange();
        }}
      >
        <img src={item.img_url} className={styles.img} />
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
        <div className={styles.spot}>{item.imageIdx}</div>
      </div>
    </div>
  );
};

const LabelPage = ({ imgHeight, ip, light }) => {
  const [data, setData] = useState<IClassItem[]>([]);
  useEffect(() => {
    db.getImageClassTask().then(setData);
  }, []);
  const ref = useRef(null);
  return (
    <div className="card-content">
      <Header ref={ref} />
      <div className={styles.detail}>
        {data.map((item) => (
          <ImageItem
            key={item.img_url}
            onChange={() => {}}
            item={item}
            light={light}
            imgHeight={imgHeight}
          ></ImageItem>
        ))}
      </div>
    </div>
  );
};

export default connect(({ common }: { common: ICommon }) => ({
  ip: common.ip,
  imgHeight: common.imgHeight,
  light: common.light,
}))(LabelPage);
