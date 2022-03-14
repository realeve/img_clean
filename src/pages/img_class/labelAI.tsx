import { message, Button } from 'antd';

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
import { MenuList, IErrorType } from './label';

export const ImageItem = ({
  item,
  onChange,
  imgHeight = defaultImageSize,
  light = false,
  errtype,
  onChoose,
  setRightPred,
}: {
  item: IClassItem;
  imgHeight: number;
  onChange: (e: number) => void;
  onChoose?: () => void;
  light?: boolean;
  errtype: IErrorType;
  setRightPred: () => void;
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

  const [hide, setHide] = useState(false);

  const scale = imgHeight / originSize;

  return (
    <div
      className={styles.imageItem}
      style={{
        height: imgHeight + 150,
        width: imgHeight,
        display: !hide ? 'block' : 'none',
      }}
    >
      <div
        className={styles.detail}
        style={{
          height: imgHeight,
          width: imgHeight * 2,
          filter: `brightness(${light ? 2 : 1})`,
        }}
      >
        <img
          src={item.img_url}
          style={{ width: imgHeight * 2 }}
          className={styles.img}
          onClick={() => {
            onChoose?.();
            onChoose && setHide(true);
          }}
        />
        {box && (
          <div
            className={styles.box}
            style={{
              left: scale * box.x1,
              top: scale * box.y1,
              width: scale * (box.x2 - box.x1),
              height: scale * (box.y2 - box.y1),
            }}
            onClick={() => {
              onChoose?.();
              onChoose && setHide(true);
            }}
          />
        )}
        <MenuList
          data={errtype}
          onChange={(e) => {
            onChange(e);
            setHide(true);
          }}
        />
        <span className={styles.dotLeftBottom}>
          {(item.pred1 * 100).toFixed(0)}
        </span>
      </div>
      <div className={styles.others}>
        <Button
          type="primary"
          onClick={() => {
            onChange(item.ai_flag1);
            setHide(true);
            setRightPred();
          }}
        >
          {item.err_type1}
        </Button>

        {item.pred2 > 0.001 && (
          <Button
            type="default"
            onClick={() => {
              onChange(item.ai_flag2);
              setHide(true);
            }}
          >
            {item.err_type2}({(item.pred2 * 100).toFixed(2)}%)
          </Button>
        )}

        {item.pred3 > 0.001 && (
          <Button
            type="default"
            onClick={() => {
              onChange(item.ai_flag3);
              setHide(true);
            }}
          >
            {item.err_type3}({(item.pred3 * 100).toFixed(2)}%)
          </Button>
        )}
        {item.pred4 > 0.001 && (
          <Button
            type="default"
            onClick={() => {
              onChange(item.ai_flag4);
              setHide(true);
            }}
          >
            {item.err_type4}({(item.pred4 * 100).toFixed(2)}%)
          </Button>
        )}
        {item.pred5 > 0.001 && (
          <Button
            type="default"
            onClick={() => {
              onChange(item.ai_flag5);
              setHide(true);
            }}
          >
            {item.err_type5}({(item.pred5 * 100).toFixed(2)}%)
          </Button>
        )}
      </div>
    </div>
  );
};

const LabelPage = ({
  imgHeight,
  ip,
  light,
}: {
  imgHeight: number;
  light: boolean;
  ip: string;
}) => {
  const [data, setData] = useState<{ [key: string]: IClassItem[] }>({});
  const [rightPred, setRightPred] = useState(0);
  const [errtype, setErrtype] = useState<IErrorType>({
    其它: [],
    凹印: [],
    胶印: [],
  });

  const [errList, setErrList] = useState<IErrorTypeItem[]>([]);

  const [imgNum, setImgNum] = useState(0);

  const ref = useRef(null);

  const [choosedId, setChoosedId] = useState<number[]>([]);
  const [chooseKey, setChooseKey] = useState<string[]>([]);

  const refreshImageList = () => {
    setChoosedId([]);
    setChooseKey([]);
    db.getImageClassTask().then((res) => {
      setData(R.groupBy(R.prop('err_type1'), res));
      setImgNum(res.length);
      setRightPred(0);
    });
    ref?.current?.refresh?.();
  };

  useEffect(() => {
    refreshImageList();
    db.getImageErrtype().then((res) => {
      let procs = R.groupBy(R.prop('proc_name'), res);
      setErrtype(procs);
      setErrList(res);
    });
  }, []);

  const [curtype, setCurType] = useState(0);
  const [curTypeDetail, setCurTypeDetail] = useState<IErrorTypeItem>();

  const updateImageList = (id: number) => {
    // 同步更新
    setImgNum((num) => num - 1);

    if (imgNum > 1) {
      return;
    }

    refreshImageList();
  };

  const labelOneImg = async (_id: number | number[], audit_flag: number) => {
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

    let nextId = choosedId;
    if (typeof _id == 'number') {
      nextId = [...nextId, _id];
    } else {
      nextId = [...nextId, ..._id];
    }
    setChoosedId(nextId);
  };

  const updateChoosedTypename = (typeid: number) => {
    setCurType(typeid);
    setCurTypeDetail(errList.find((item) => item.err_typeid == typeid));
  };

  return (
    <div className="card-content">
      <Header ref={ref} />
      <Button
        type="primary"
        style={{ margin: '10px 0 0 20px' }}
        onClick={refreshImageList}
      >
        手动加载数据
      </Button>

      <div className={styles.toolContainer}>
        标记类型：
        <span className={styles.highlight}>
          {curTypeDetail
            ? curTypeDetail.proc_name + curTypeDetail.err_type
            : '未选择'}
        </span>
        <br />
        本页正确数：<span className={styles.highlight}>{rightPred}/40</span>
        {/* <MenuList data={errtype} onChange={updateChoosedTypename} /> */}
      </div>

      <div className={styles.result} style={{ marginTop: 30 }}>
        {Object.keys(data)
          .filter((key) => !chooseKey.includes(key))
          .map((key, id) => (
            <div className={styles.row} key={key}>
              <div className={styles.title}>
                <span>
                  {id + 1}.{key}
                </span>
                <Button
                  type="default"
                  style={{ marginLeft: 20 }}
                  onClick={() => {
                    let id = data[key].map((item) => item.id);
                    let typeid = data[key][0].ai_flag1;
                    id = id.filter((item) => !choosedId.includes(item));
                    setChooseKey([...chooseKey, key]);
                    labelOneImg(id, typeid);
                  }}
                >
                  批量确认
                </Button>
              </div>
              <div className={styles.detail}>
                {data[key].map((item) => (
                  <ImageItem
                    key={item.id}
                    setRightPred={() => {
                      setRightPred((rightPred) => rightPred + 1);
                    }}
                    onChange={(typeid: number) => {
                      if (typeid != curtype) {
                        updateChoosedTypename(typeid);
                      }
                      labelOneImg(item.id, typeid);
                    }}
                    item={item}
                    light={light}
                    imgHeight={imgHeight}
                    errtype={errtype}
                  />
                ))}
              </div>
            </div>
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
