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

  const [dataLoading, setDataLoading] = useState(true);

  const handleImgs = (imgs: IAuditItem[]) => {
    if (imgs.length === 0) {
      setJudgeData({ fake: [], normal: [] });
      return;
    }

    setJudgeData({
      fake: imgs
        .filter((item) => item.audit_flag == '2')
        .map((item) => item.id),
      normal: imgs
        .filter((item) => item.audit_flag == '3')
        .map((item) => item.id),
    });
    let users = imgs.map((item) => item.username);
    users = R.uniq(users);
    let append = imgs?.[0]?.check_ip ? ` (${imgs[0].check_ip}审核)` : '';
    setJudgeUser(users[0] + append);
  };

  const [imgs, setImgs] = useState<IAuditItem[]>([]);

  const refeshData = () => {
    if (ip.length === 0) {
      return;
    }
    setDataLoading(true);
    setImgs([]);
    handleImgs([]);
    if (curUser == '') {
      db.getImageJudge({
        manual_flag: judgeType,
        max_id: maxId,
        audit_flag: [2, 3],
      }).then((res) => {
        setImgs(res);
        setDataLoading(false);
        handleImgs(res);
      });
      return;
    }

    db.getImageJudgeByIp({
      manual_flag: judgeType,
      max_id: maxId,
      ip: curUser,
      audit_flag: [2, 3],
    }).then((res) => {
      setImgs(res);
      setDataLoading(false);
      handleImgs(res);
    });
  };

  useEffect(refeshData, [maxId, curUser]);

  const ref = useRef(null);
  const pageRef = useRef(null);

  const [judgeData, setJudgeData] = useSetState<{
    fake: number[];
    normal: number[];
  }>({
    fake: [],
    normal: [],
  });

  const [judgeUser, setJudgeUser] = useState<string>('');

  return (
    <div className="card-content">
      <AuditHead ref={ref} onLoadData={setJudgeType} />
      <Pagination
        judgeType="difficult"
        ref={pageRef}
        judgeUser={judgeUser}
        setMaxId={setMaxId}
      />
      <JudgePage
        judgeData={judgeData}
        setJudgeData={setJudgeData}
        judgeType={judgeType}
        data={imgs}
        onRefresh={() => {
          pageRef?.current?.nextPage?.();
        }}
        isCheckPage
      />
    </div>
  );
}

export default connect(({ common }: { common: ICommon }) => ({
  ip: common.ip,
  curUser: common.curUser,
}))(IndexPage);
