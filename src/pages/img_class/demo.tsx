import { Alert } from 'antd';
import styles from './label.less';
import { useState, useEffect } from 'react';
import { connect } from 'dva';
import { ICommon } from '@/models/common';
import Header from './Head';
import * as db from './db';
import { IClassItem, IErrorTypeItem } from './db';
import * as R from 'ramda';
import { ImageItem, IErrorType, MenuList } from './label';

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

  const [errtype, setErrtype] = useState<IErrorType>({
    其它: [],
    凹印: [],
    胶印: [],
  });

  const [errlist, setErrlist] = useState([]);

  const refreshImageList = () => {
    db.getErrorType().then((res) => {
      setData(R.groupBy(R.prop('err_type'), res));
    });
  };

  useEffect(() => {
    refreshImageList();
    db.getImageErrtype().then((res) => {
      let procs = R.groupBy(R.prop('proc_name'), res);
      setErrtype(procs);
      setErrlist(res);
    });
  }, []);

  return (
    <div className="card-content">
      <Header />
      <Alert
        style={{ width: '50%', margin: '20px 0' }}
        type="success"
        message={<b>提示</b>}
        description={
          <div>
            本页面展示目前所分类的{errlist.length}
            种缺陷类型，每种类型随机选取5种，刷新页面将选择其它同类型的图片以作参考。
            <br />
            右侧显示了不同工序的所有缺陷类型的菜单项
          </div>
        }
      />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          right: 20,
          justifyContent: 'flex-end',
          width: 300,
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontWeight: 'bold',
            width: 100,
            color: '#23d',
            fontSize: 18,
          }}
        >
          类型列表
        </span>
        <MenuList
          data={errtype}
          onChange={(e) => {
            console.log(e);
          }}
        />
      </div>
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
                    console.log(item.id, typeid);
                  }}
                  item={item}
                  light={light}
                  imgHeight={imgHeight}
                  errtype={errtype}
                  showMenu={false}
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
}))(LabelResultPage);
