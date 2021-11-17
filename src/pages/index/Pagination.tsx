import { Pagination } from 'antd';
import { useState, useEffect } from 'react';
import * as db from './db';

import { connect } from 'dva';
import { ICommon } from '@/models/common';

const PagPage = ({
  setMaxId,
  judgeUser,
  curUser,
}: {
  setMaxId: (e: number) => void;
  judgeUser: string[];
  curUser: string;
}) => {
  const [pages, setPages] = useState<{ pageNum: number; id: number }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    if (curUser == '') {
      db.getImageJudgePageIndex().then(setPages);
      return;
    }
    if (window.location.href.includes('/main/result')) {
      db.getImageJudgePageIndexByIp(curUser).then(setPages);
    }
  }, [curUser]);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    setMaxId(pages[page - 1].id);
  };
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 30,
      }}
    >
      <div style={{ fontSize: 20 }}>
        本页判废人员：
        <span style={{ fontWeight: 'bold' }}>{judgeUser.join('、')}</span>
      </div>
      <Pagination
        current={currentPage}
        defaultCurrent={1}
        total={pages.length * 100}
        onChange={onPageChange}
        pageSize={100}
        showSizeChanger={false}
      />
    </div>
  );
};

export default connect(({ common }: { common: ICommon }) => ({
  curUser: common.curUser,
}))(PagPage);
