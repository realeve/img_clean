import * as db from './db';
import { IImageItem } from './db';

import { useState, useEffect, useRef } from 'react';
import JudgePage, { IJudgeData } from './judge';
import { connect } from 'dva';
import { ICommon } from '@/models/common';

import AuditHead from './Head';
import { useSetState } from 'react-use';

function IndexPage({ ip, judgeType }: { ip: string; judgeType: '0' | '1' }) {
  const [imgs, setImgs] = useState<IImageItem[]>([]);

  const [dataLoading, setDataLoading] = useState(true);
  const refeshData = () => {
    if (ip.length === 0) {
      return;
    }
    setDataLoading(true);
    setImgs([]);
    db.getImgs({ manual_flag: judgeType, ip }).then((res) => {
      setImgs(res);
      setDataLoading(false);
      let _id = res.map((item) => item.id);
      if (_id.length == 0) {
        return;
      }
      db.receiveImageJudge({ ip, _id });
    });
  };
  useEffect(refeshData, [ip, judgeType]);

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
      <AuditHead ref={ref} />
      <JudgePage
        judgeData={judgeData}
        setJudgeData={setJudgeData}
        judgeType={judgeType}
        data={imgs}
        onRefresh={() => {
          refeshData();
          if (!ref) {
            return;
          }
          ref.current?.refresh?.();
        }}
      />
    </div>
  );
}

export default connect(({ common }: { common: ICommon }) => ({
  ip: common.ip,
  judgeType: common.judgeType,
}))(IndexPage);
