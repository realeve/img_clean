import { message } from 'antd';
import styles from './label.less';
import { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { ICommon } from '@/models/common';
import Header from './Head';
import * as db from './db';
import * as lib from '@/utils/lib';
import { IClassItem, IErrorTypeItem } from './db';
import * as R from 'ramda';
import { ImageItem, IErrorType } from './label';
import Pagination from './pagination';

const LabelResultPage = ({
  imgHeight,
  ip,
  light,
}: {
  imgHeight: number;
  light: boolean;
  ip: string;
}) => {
  const [data, setData] = useState<{ [key: string]: IClassItem[] }>({});

  const [maxId, setMaxId] = useState(0);

  const [errtype, setErrtype] = useState<IErrorType>({
    其它: [],
    凹印: [],
    胶印: [],
  });

  const [imgNum, setImgNum] = useState(0);

  const [errList, setErrList] = useState<IErrorTypeItem[]>([]);

  const refPage = useRef(null);

  const refreshImageList = () => {
    db.getImageClassResult(maxId).then((res) => {
      setData(R.groupBy(R.prop('err_type'), res));
      setImgNum(res.length);
    });
  };

  useEffect(() => {
    refreshImageList();
  }, [maxId]);

  useEffect(() => {
    db.getImageErrtype().then((res) => {
      let procs = R.groupBy(R.prop('proc_name'), res);
      setErrtype(procs);
      setErrList(res);
    });
  }, []);

  const updateImageList = (id: number) => {
    // 同步更新
    setImgNum((num) => num - 1);

    if (imgNum > 1) {
      return;
    }

    refPage?.current?.nextPage?.();
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
      <Header />
      <Pagination setMaxId={setMaxId} refInstance={refPage} />

      <div className={styles.result}>
        {Object.keys(data).map((key, id) => (
          <div className={styles.row} key={key}>
            <h3 className={styles.title}>
              <span>
                {id + 1}.{key}
              </span>
            </h3>
            <div className={styles.detail}>
              {data[key].map((item) => (
                <ImageItem
                  key={item.id}
                  onChange={(typeid: number) => {
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
      <Pagination setMaxId={setMaxId} refInstance={refPage} />
    </div>
  );
};

export default connect(({ common }: { common: ICommon }) => ({
  ip: common.ip,
  imgHeight: common.imgHeight,
  light: common.light,
}))(LabelResultPage);
