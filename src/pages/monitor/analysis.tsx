import { useState, useEffect } from 'react';
import styles from './analysis.less';
import classnames from 'classnames';
import { Input, Button, message } from 'antd';
import { rules } from '@/utils/lib';

import { getBanknoteDetail, IAnalyImageItem } from './db';

import ImageSize from '@/component/ImageSize';
import { connect } from 'dva';
import { ICommon } from '@/models/common';
import * as R from 'ramda';

type TAnanyResult = Record<string, IAnalyImageItem[]>;

const fakeType = ['误废', '实废'];

const JudgeResult = ({ title, type }: { title: string; type: number }) => (
  <span
    className={classnames({
      [styles.fake]: type == 1,
      [styles.normal]: type == 0,
    })}
  >
    {title}:{fakeType[type]}
  </span>
);

const KiloContent = ({
  data,
  kilo,
  imgHeight,
}: {
  data: IAnalyImageItem[];
  kilo: number;
  imgHeight: number;
}) => {
  const [list, setList] = useState<TAnanyResult>({});
  useEffect(() => {
    setList(R.groupBy(R.prop('ex_codenum'), data));
  }, [data]);

  return (
    <div className={styles.kilo}>
      <div className={styles.kilotitle}>
        第<span>{kilo}</span>千,共<span>{data.length}</span>张图像
      </div>
      <div className={styles.content}>
        {Object.keys(list).map((code) => (
          <div className={styles.codeMain}>
            <label>
              印码号:{code}, {list[code][0].format_pos}开
            </label>
            <div
              className={classnames({
                [styles.imglist]: list[code].length > 1,
              })}
            >
              {list[code].map((item) => (
                <div
                  className={styles.item}
                  style={{ height: imgHeight, width: imgHeight }}
                  key={item.id}
                >
                  <img src={item.image} alt={item.ex_codenum} />
                  <div className={styles.dot}>{item.probability}%</div>
                  <div className={styles.dotLeft}>
                    <JudgeResult title="人工" type={item.human_result} />
                    <JudgeResult title="AI" type={item.ai_result} />
                    <JudgeResult title="审核" type={item.verify_result} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnanyPage = ({ imgHeight }: { imgHeight: number }) => {
  const [cart, setCart] = useState('2175G399');
  const [result, setResult] = useState<TAnanyResult>({});
  const [loading, setLoading] = useState(false);
  const onSearch = async () => {
    if (!rules.cart.test(cart)) {
      message.error('请输入有效的车号信息');
      return;
    }
    setLoading(true);
    let data = await getBanknoteDetail(cart).finally(() => {
      setLoading(false);
    });
    setResult(data);
    message.success('数据加载完毕');
  };

  return (
    <div className={classnames(styles.analysis, 'card-content')}>
      <ImageSize />
      <div className={styles.input}>
        <label>车号：</label>
        <Input.Search
          value={cart}
          loading={loading}
          onChange={(e) => {
            setCart(e.target.value.toUpperCase().trim());
          }}
          onPressEnter={onSearch}
          onSearch={onSearch}
          placeholder="请在此输入车号"
        />
      </div>
      {cart.length > 0 && (
        <div className={styles.result}>
          <div className={styles.title}>
            车号<span>{cart}</span>AI与人工不一致图像
          </div>
          {Object.keys(result).map((kilo) => (
            <KiloContent
              key={kilo}
              data={result[kilo]}
              kilo={Number(kilo)}
              imgHeight={imgHeight}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default connect(({ common }: { common: ICommon }) => ({
  imgHeight: common.imgHeight,
}))(AnanyPage);
