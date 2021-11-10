import * as db from './db';
import { IImageItem } from './db';

import { useState, useEffect, useRef } from 'react';
import JudgePage from './judge';
import { connect } from 'dva';
import { ICommon } from '@/models/common';

import AuditHead, { defaultImageSize } from './Head';

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

  return (
    <div className="card-content">
      <AuditHead
        ref={ref}
        ip={ip}
        onLoadData={setJudgeType}
        updateImgHeight={setImgHeight}
      />
      <JudgePage
        loading={dataLoading}
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
