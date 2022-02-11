import React, { useState, useEffect } from 'react';
import styles from './analysis.less';
import classnames from 'classnames';
import { Input, message, Radio, Button, Modal, Empty } from 'antd';
import { rules } from '@/utils/lib';

import {
  getBanknoteDetail,
  IAnalyImageItem,
  analysisImageJudge,
  getLeakDetail,
  getAiLeakDetail,
  IAiLeakItem,
} from './db';

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

const ImageItem = ({
  imgHeight,
  data,
  style = {},
}: {
  imgHeight: number;
  data: IAnalyImageItem;
  style?: React.CSSProperties;
}) => (
  <div
    className={styles.imgItem}
    style={{ height: imgHeight, width: imgHeight, ...style }}
  >
    <img src={data.image} alt={data.ex_codenum} />
    <div className={styles.dot}>{data.probability}%</div>
    <div className={styles.dotLeft}>
      <JudgeResult title="人工" type={data.human_result} />
      <JudgeResult title="AI" type={data.ai_result} />
      {typeof data.verify_result == 'string' && (
        <JudgeResult title="审核" type={data.verify_result} />
      )}
      {data.verify_result2 > '-1' && (
        <JudgeResult title="实物" type={data.verify_result2} />
      )}
    </div>
  </div>
);

const ActionButtons = ({
  value,
  ids,
  ip,
}: {
  value: number;
  ids: string[];
  ip: string;
}) => (
  <div className={styles.action}>
    <Radio.Group
      defaultValue={value}
      buttonStyle="solid"
      onChange={(e) => {
        let verify_result = e.target.value;
        analysisImageJudge({
          verify_result,
          _id: ids,
          ip,
        }).then((success) => {
          if (!success) {
            message.error('数据更新失败，请刷新重试');
          }
          message.success('更新成功');
        });
      }}
      size="large"
    >
      <Radio.Button value="0">误废</Radio.Button>
      <Radio.Button value="1">实废</Radio.Button>
    </Radio.Group>
  </div>
);

const KiloContent = ({
  data,
  kilo,
  imgHeight,
  ip,
}: {
  data: IAnalyImageItem[];
  kilo: number;
  imgHeight: number;
  ip: string;
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
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {code.slice(0, 6)}
                <span
                  style={{ color: '#e23', fontWeight: 'bold', marginLeft: 10 }}
                >
                  {code.slice(6, 10)}
                </span>
              </div>
              <div>
                <span>{list[code][0].format_pos}</span>开
              </div>
            </label>
            <div
              className={classnames({
                [styles.imglist]: list[code].length > 1,
                [styles.imgContainer]: list[code].length == 1,
              })}
            >
              {list[code].map((item) => (
                <ImageItem key={item.id} imgHeight={imgHeight} data={item} />
              ))}
            </div>
            <ActionButtons
              ip={ip}
              value={list[code][0].verify_result2}
              ids={list[code].map((item) => item.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const AnanyPage = ({ imgHeight, ip }: { imgHeight: number; ip: string }) => {
  const [cart, setCart] = useState('');
  const [result, setResult] = useState<TAnanyResult>({});
  const [loading, setLoading] = useState(false);
  const onSearch = async () => {
    if (!rules.cart.test(cart)) {
      message.error('请输入有效的车号信息');
      return;
    }
    setAileak([]);
    setLoading(true);
    getAiLeakDetail(cart).then(setAileak);
    let data = await getBanknoteDetail(cart).finally(() => {
      setLoading(false);
    });
    setResult(data);
    message.success('数据加载完毕');
  };

  const [aileak, setAileak] = useState<IAiLeakItem[]>([]);

  const [show, setShow] = useState(false);
  const [code, setCode] = useState('');
  const [codeDetail, setCodeDetail] = useState<IAnalyImageItem[]>([]);
  const [loading2, setLoading2] = useState(false);
  const onSearchCode = async () => {
    if (code.length != 10) {
      message.error('请输入有效的号码信息');
      return;
    }
    setCodeDetail([]);
    getLeakDetail({ cart, ex_codenum: code }).then(setCodeDetail);
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

      <div>
        <div style={{ marginTop: 20, textAlign: 'center', width: 250 }}>
          本万产品AI漏检号码列表 {aileak.length == 0 && <b>本万无漏检</b>}
        </div>
        {aileak.length > 0 && (
          <ol>
            <li style={{ fontWeight: 'bold' }}>
              <div>号码</div>
              <div>千位</div>
              <div>开位</div>
            </li>
          </ol>
        )}
        <ol>
          {aileak.map((item) => (
            <li key={item.ex_codenum}>
              <div>{item.ex_codenum}</div>
              <div>{item.kilo}</div>
              <div>{item.format_pos}</div>
            </li>
          ))}
        </ol>
      </div>

      <Modal
        bodyStyle={{ padding: '0 12px 12px 12px', minHeight: 600 }}
        title={`【${cart}】AI与人工共同漏判图像查询`}
        visible={show}
        onCancel={() => setShow(false)}
        footer={null}
        width={1000}
      >
        <div className={styles.input} style={{ marginBottom: 10 }}>
          <label>印码号：</label>
          <Input.Search
            value={code}
            loading={loading2}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().trim());
            }}
            onPressEnter={onSearchCode}
            onSearch={onSearchCode}
            placeholder="请在此输入车号"
          />
        </div>
        <div className={styles.content}>
          {loading2 && '数据查询中'}
          {!loading2 && codeDetail.length == 0 && code.length == 10 && (
            <Empty
              style={{ marginTop: 30 }}
              description="当前印码号机检系统未检出，未参与判废，可能是印码漏检或号码输入错误。"
            ></Empty>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {codeDetail.map((item) => (
              <ImageItem
                key={item.id}
                imgHeight={imgHeight}
                data={item}
                style={{ margin: 5 }}
              />
            ))}
          </div>
          <ActionButtons
            ip={ip}
            value={codeDetail[0]?.verify_result2}
            ids={codeDetail.map((item) => item.id)}
          />
        </div>
      </Modal>
      {cart.length > 0 && (
        <div className={styles.result}>
          <div className={styles.title}>
            车号<span>{cart}</span>AI与人工不一致图像
          </div>
          <Button
            type="primary"
            style={{ position: 'absolute', right: 10, top: 10 }}
            onClick={() => {
              setShow(true);
            }}
          >
            共同漏检图像
          </Button>
          {Object.keys(result).map((kilo) => (
            <KiloContent
              key={result[kilo][0].ex_codenum}
              data={result[kilo]}
              kilo={Number(kilo)}
              imgHeight={imgHeight}
              ip={ip}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default connect(({ common }: { common: ICommon }) => ({
  imgHeight: common.imgHeight,
  ip: common.ip,
}))(AnanyPage);
