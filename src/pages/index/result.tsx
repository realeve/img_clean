import * as db from './db';
import { IAuditItem } from './db';

import { useState, useEffect, useRef } from 'react';
import JudgePage from './judge';
import { connect } from 'dva';
import { ICommon } from '@/models/common';

import AuditHead, { defaultImageSize } from './Head';

import { useSetState } from 'react-use';

function IndexPage({ ip }) {
  const [judgeType, setJudgeType] = useState<'0' | '1'>('0');

  const [imgHeight, setImgHeight] = useState(defaultImageSize);

  const [maxId, setMaxId] = useState(0);

  const [imgs, setImgs] = useState<IAuditItem[]>([]);

  const [dataLoading, setDataLoading] = useState(true);
  const refeshData = () => {
    setDataLoading(true);
    setImgs([]);
    db.getImageJudge({ manual_flag: judgeType, max_id: maxId }).then((res) => {
      setImgs(res);
      setDataLoading(false);
    });
  };
  useEffect(refeshData, []);

  const ref = useRef(null);

  const [judgeData, setJudgeData] = useSetState<{
    fake: number[];
    normal: number[];
  }>({
    fake: [],
    normal: [],
  });

  useEffect(() => {
    if (imgs.length === 0) {
      setJudgeData({ fake: [], normal: [] });
      return;
    }

    setJudgeData({
      fake: imgs
        .filter((item) => item.audit_flag == '1')
        .map((item) => item.id),
      normal: imgs
        .filter((item) => item.audit_flag == '0')
        .map((item) => item.id),
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
        }}
        imgHeight={imgHeight}
        ip={ip}
      />
    </div>
  );
}

export default connect(({ common }: { common: ICommon }) => ({
  ip: common.ip,
}))(IndexPage);
