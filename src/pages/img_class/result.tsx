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

const LabelResultPage = ({
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
    db.getImageClassResult().then(setData);
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

  // const [curtype, setCurType] = useState(0);
  // const [curTypeDetail, setCurTypeDetail] = useState<IErrorTypeItem>();

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

  // const updateChoosedTypename = (typeid: number) => {
  //     setCurType(typeid);
  //     setCurTypeDetail(errList.find((item) => item.err_typeid == typeid));
  // };

  return (
    <div className="card-content">
      <Header ref={ref} />
      {/* <div className={styles.toolContainer}>
                <span className={styles.highlight}>
                    {curTypeDetail
                        ? curTypeDetail.proc_name + curTypeDetail.err_type
                        : '未选择'}
                </span>
                <MenuList data={errtype} onChange={updateChoosedTypename} />
            </div> */}
      <div className={styles.detail}>
        {data.map((item) => (
          <ImageItem
            key={item.id}
            onChange={(typeid: number) => {
              // if (typeid != curtype) {
              //     updateChoosedTypename(typeid);
              // }
              labelOneImg(item.id, typeid);
            }}
            // onChoose={() => {
            //     if (curtype == 0) {
            //         message.error('请先选择右侧的缺陷类型标记工具');
            //         return;
            //     }
            //     labelOneImg(item.id, curtype);
            // }}
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
}))(LabelResultPage);
