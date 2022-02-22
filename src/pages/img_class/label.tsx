import { Menu, message } from 'antd';

import styles from './label.less';

import { useState, useEffect, useRef } from 'react';

import { connect } from 'dva';
import { ICommon } from '@/models/common';

import Header from './Head';
import * as db from './db';
import * as lib from '@/utils/lib';

import { IClassItem, IErrorTypeItem } from './db';
import { fetchXML, IBoxItem } from '@/pages/index/lib';
import * as R from 'ramda';
import { originSize, defaultImageSize } from '@/pages/index/Head';

const MenuList = ({
  data,
  onChange,
}: {
  data: IErrorType;
  onChange: (e: number) => void;
}) => (
  <Menu className={styles.tools} mode="horizontal">
    {Object.entries(data).map(([key, errItem]: [string, IErrorTypeItem[]]) => (
      <Menu.SubMenu key={key} title={key} style={{ padding: '0 15px' }}>
        {errItem.map((errtypeItem) => (
          <Menu.Item
            style={{
              lineHeight: '30px',
              height: 30,
              marginBottom: 0,
              marginTop: 0,
            }}
            key={errtypeItem.err_typeid}
            className={styles.menuItem}
            onClick={() => {
              onChange(errtypeItem.err_typeid);
            }}
          >
            {' '}
            {errtypeItem.err_type}
          </Menu.Item>
        ))}
      </Menu.SubMenu>
    ))}
  </Menu>
);

export const ImageItem = ({
  item,
  onChange,
  imgHeight = defaultImageSize,
  light = false,
  errtype,
  onChoose,
}: {
  item: IClassItem;
  imgHeight: number;
  onChange: (e: number) => void;
  onChoose: () => void;
  light?: boolean;
  errtype: IErrorType;
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
      style={{
        height: imgHeight,
        width: imgHeight,
      }}
    >
      <div
        className={styles.detail}
        style={{ height: imgHeight, filter: `brightness(${light ? 2 : 1})` }}
      >
        <img src={item.img_url} className={styles.img} onClick={onChoose} />
        {box && (
          <div
            className={styles.box}
            style={{
              left: scale * box.x1,
              top: scale * box.y1,
              width: scale * (box.x2 - box.x1),
              height: scale * (box.y2 - box.y1),
            }}
            onClick={onChoose}
          />
        )}
        <MenuList data={errtype} onChange={onChange} />
      </div>
    </div>
  );
};

interface IErrorType {
  其它: IErrorTypeItem[];
  凹印: IErrorTypeItem[];
  胶印: IErrorTypeItem[];
}
const LabelPage = ({
  imgHeight,
  ip,
  light,
}: {
  imgHeight: number;
  light: boolean;
  ip: string;
}) => {
  const [data, setData] = useState<IClassItem[]>([]);

  const [errtype, setErrtype] = useState<IErrorType>({
    其它: [],
    凹印: [],
    胶印: [],
  });

  const [errList, setErrList] = useState<IErrorTypeItem[]>([]);

  const refreshImageList = () => {
    db.getImageClassTask().then(setData);
  };

  useEffect(() => {
    refreshImageList();
    db.getImageErrtype().then((res) => {
      let procs = R.groupBy(R.prop('proc_name'), res);
      setErrtype(procs);
      setErrList(res);
    });
  }, []);
  const ref = useRef(null);

  const [curtype, setCurType] = useState(0);
  const [curTypeDetail, setCurTypeDetail] = useState<IErrorTypeItem>();

  const updateImageList = (id: number) => {
    let nextData = R.reject((item) => item.id == id, data);
    if (nextData.length > 0) {
      setData(nextData);
      return;
    }
    refreshImageList();
  };

  const labelOneImg = async (_id: number, audit_flag: number) => {
    let success = await db.setImageClass({
      _id,
      audit_flag,
      audit_date: lib.now(),
      ip,
    });
    if (!success) {
      message.error('数据提交失败，请稍后重试');
      return;
    }
    message.success('标记成功');
    updateImageList(_id);
  };

  return (
    <div className="card-content">
      <Header ref={ref} />
      <div className={styles.toolContainer}>
        <span className={styles.highlight}>
          {curTypeDetail
            ? curTypeDetail.proc_name + curTypeDetail.err_type
            : '未选择'}
        </span>
        <MenuList
          data={errtype}
          onChange={(e) => {
            setCurType(e);
            setCurTypeDetail(errList.find((item) => item.err_typeid == e));
          }}
        />
      </div>
      <div className={styles.detail}>
        {data.map((item) => (
          <ImageItem
            key={item.id}
            onChange={(typeid: number) => {
              labelOneImg(item.id, typeid);
            }}
            onChoose={() => {
              if (curtype == 0) {
                message.error('请先选择右侧的缺陷类型标记工具');
                return;
              }
              labelOneImg(item.id, curtype);
            }}
            item={item}
            light={light}
            imgHeight={imgHeight}
            errtype={errtype}
          />
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
