import * as db from './db';
import { IAuditItem } from './db';

import { useState, useEffect, useRef } from 'react';
import JudgePage from './judge';
import { connect } from 'dva';
import { ICommon } from '@/models/common';

import AuditHead from './Head';

import { useSetState } from 'react-use';
import Pagination from './Pagination';
import * as R from 'ramda';

function IndexPage({ ip, curUser }: { ip: string; curUser: string }) {
  const [judgeType, setJudgeType] = useState<'0' | '1'>('0');

  const [maxId, setMaxId] = useState(0);

  const [imgs, setImgs] = useState<IAuditItem[]>([]);

  const [dataLoading, setDataLoading] = useState(true);

  const refeshData = () => {
    if (ip.length === 0) {
      return;
    }
    setDataLoading(true);
    setImgs([]);
    if (curUser == '') {
      db.getImageJudge({ manual_flag: judgeType, max_id: maxId }).then(
        (res) => {
          setImgs(res);
          setDataLoading(false);
        },
      );
      return;
    }

    db.getImageJudgeByIp({
      manual_flag: judgeType,
      max_id: maxId,
      ip: curUser,
    }).then((res) => {
      setImgs(res);
      setDataLoading(false);
    });
  };
  useEffect(refeshData, [maxId, curUser]);

  const ref = useRef(null);

  const [judgeData, setJudgeData] = useSetState<{
    fake: number[];
    normal: number[];
  }>({
    fake: [],
    normal: [],
  });

  const [judgeUser, setJudgeUser] = useState<string[]>([]);

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
    let users = imgs.map((item) => item.username);
    users = R.uniq(users);
    setJudgeUser(users);
  }, [imgs]);

  return (
    <div className="card-content">
      <AuditHead ref={ref} onLoadData={setJudgeType} />
      <Pagination judgeUser={judgeUser} setMaxId={setMaxId} />
      <JudgePage
        judgeData={judgeData}
        setJudgeData={setJudgeData}
        judgeType={judgeType}
        data={imgs}
        onRefresh={() => {
          refeshData();
        }}
      />
    </div>
  );
}

export default connect(({ common }: { common: ICommon }) => ({
  ip: common.ip,
  curUser: common.curUser,
}))(IndexPage);
