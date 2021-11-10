import { Skeleton, Radio, Row, Col } from 'antd';
import { DEV } from '@/utils/setting';
import useFetch from '@/component/hooks/useFetch';

import { useState, useEffect } from 'react';
import styles from './index.less';

import { saveImageSize, getImageSize } from './lib';

type TTaskNum = { manual_flag: number; img_num: number };

import { forwardRef, useImperativeHandle } from 'react';

export const originSize = 112;
export const imgSize = [112, 128, 192, 224, 256, 384];
export const defaultImageSize = 192;

export default forwardRef(
  (
    {
      ip,
      onLoadData,
      updateImgHeight,
    }: {
      ip: string;
      onLoadData: (e: '0' | '1') => void;
      updateImgHeight: (e: number) => void;
    },
    ref,
  ) => {
    const { data, loading, reFetch } = useFetch<TTaskNum>({
      param: {
        url: DEV ? '@/mock/1392_70919f0f45.json' : '/1392/70919f0f45.json',
      },
      callback: (e) => {
        const data = { fake: 0, normal: 0 };
        e.data.forEach((item: TTaskNum) => {
          if (item.manual_flag == 1) {
            data.fake = item.img_num;
          } else if (item.manual_flag == 0) {
            data.normal = item.img_num;
          }
        });
        return data;
      },
    });

    /**
     *   useFetch (React hooks)
     *   @database: { 生产指挥中心BI数据 }
     *   @desc:     { 我的判废数量 }
     *   useFetch 返回值说明： data(返回数据), error(报错), loading(加载状态), reFetch(强制刷新),setData(强制设定数据)
     */
    const {
      data: judgeNum,
      loading: judgeLoading,
      reFetch: refetchJudge,
    } = useFetch<{
      fake: number;
      normal: number;
    }>({
      param: {
        url: `/1394/2f1cbb3ffe.json`,
        params: {
          ip,
        },
      },
      valid: () => ip.length > 0,
      callback: (e) => e.data?.[0] || { fake: 0, normal: 0 },
    });

    const [judgeType, setJudgeType] = useState<'0' | '1'>('0');

    useImperativeHandle(ref, () => ({
      refresh: () => {
        refetchJudge();
        reFetch();
      },
    }));

    const [imgHeight, setImgHeight] = useState(defaultImageSize);

    useEffect(() => {
      let height = getImageSize(defaultImageSize);
      setImgHeight(height);
      updateImgHeight(height);
    }, []);

    return (
      <Row className={styles.head}>
        <Col span={18}>
          <div className={styles.main}>
            <div className={styles.item}>
              <div style={{ width: 200 }}>待判废数据：</div>
              <Skeleton
                title={false}
                active
                loading={loading}
                paragraph={{ rows: 1, width: 300 }}
              >
                {data && `实废：${data.fake}, 误废：${data.normal}`}
              </Skeleton>
            </div>
            <div className={styles.item}>
              <div style={{ width: 200 }}>{ip} 已判废:</div>
              <Skeleton
                title={false}
                active
                loading={judgeLoading}
                paragraph={{ rows: 1, width: 300 }}
              >
                {judgeNum && `实废：${judgeNum.fake}, 误废：${judgeNum.normal}`}
              </Skeleton>
            </div>
          </div>
        </Col>
        <Col span={6}>
          <Radio.Group
            defaultValue="1"
            value={judgeType}
            buttonStyle="solid"
            onChange={(e) => {
              setJudgeType(e.target.value);
              onLoadData(e.target.value);
            }}
            className={styles.action}
          >
            <Radio.Button value="1">加载实废</Radio.Button>
            <Radio.Button value="0">加载误废</Radio.Button>
          </Radio.Group>
        </Col>
        <Col span={24} style={{ marginTop: 10 }}>
          图片默认大小(像素)：
          <Radio.Group
            defaultValue={defaultImageSize}
            value={imgHeight}
            buttonStyle="solid"
            onChange={(e) => {
              setImgHeight(e.target.value);
              updateImgHeight(e.target.value);
              saveImageSize(e.target.value);
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
      </Row>
    );
  },
);
