import * as db from './db';
import { IImageItem } from './db';

import { useState, useEffect, useRef } from 'react';
import JudgePage, { IJudgeData } from './judge';
import { connect } from 'dva';
import { ICommon } from '@/models/common';

import AuditHead, { defaultImageSize } from './Head';

import { useSetState } from 'react-use';

function IndexPage({ ip }) {
  const [imgHeight, setImgHeight] = useState(defaultImageSize);

  const [judgeType, setJudgeType] = useState<'0' | '1'>('0');

  const [imgs, setImgs] = useState<IImageItem[]>([]);

  const [dataLoading, setDataLoading] = useState(true);
  const refeshData = () => {
    setDataLoading(true);
    setImgs([]);
    db.getImgs(judgeType).then((res) => {
      setImgs(res);
      setDataLoading(false);
    });
  };
  useEffect(refeshData, []);

  const ref = useRef(null);

  const [judgeData, setJudgeData] = useSetState<IJudgeData>({
    fake: [],
    normal: [],
  });

  useEffect(() => {
    if (imgs.length === 0) {
      setJudgeData({ fake: [], normal: [] });
      return;
    }
    const ids = imgs.map((item) => item.id);
    setJudgeData({
      fake: judgeType === '1' ? ids : [],
      normal: judgeType === '0' ? ids : [],
    });
  }, [imgs]);

  return (
    <div className="card-content">
      <AuditHead
        ref={ref}
        ip={ip}
        onLoadData={setJudgeType}
        updateImgHeight={setImgHeight}
      />
      <JudgePage
        judgeData={judgeData}
        setJudgeData={setJudgeData}
        judgeType={judgeType}
        data={imgs}
        onRefresh={() => {
          refeshData();
          ref?.current?.refresh?.();
        }}
        ip={ip}
        imgHeight={imgHeight}
      />
    </div>
  );
}

export default connect(({ common }: { common: ICommon }) => ({
  ip: common.ip,
}))(IndexPage);
