import { Pagination } from 'antd';
import { useState, useEffect } from 'react';
import * as db from './db';

import { connect } from 'dva';
import { ICommon } from '@/models/common';

import { forwardRef, useImperativeHandle } from 'react';
export interface IPaginationPage {
  setMaxId: (e: number) => void;
  judgeUser: string;
  curUser: string;
  refInstance: any;
  judgeType: 'difficult' | 'result';
  manual_flag: '0' | '1';
}
const PagPage = ({
  setMaxId,
  judgeUser,
  curUser,
  refInstance,
  judgeType,
  manual_flag,
}: IPaginationPage) => {
  const [pages, setPages] = useState<{ pageNum: number; id: number }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    let flags = judgeType == 'difficult' ? [2, 3] : [0, 1];
    if (curUser == '') {
      db.getImageJudgePageIndex(flags, manual_flag).then(setPages);
      return;
    }
    if (judgeType == 'result') {
      db.getImageJudgePageIndexByIp(curUser, flags, manual_flag).then(setPages);
    }
  }, [curUser, manual_flag]);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    setMaxId(pages[page - 1].id);
  };

  useImperativeHandle(refInstance, () => ({
    nextPage: () => {
      if (currentPage + 1 <= pages.length) {
        onPageChange(currentPage + 1);
      }
    },
  }));

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
        <span style={{ fontWeight: 'bold' }}>{judgeUser}</span>
      </div>
      <Pagination
        current={currentPage}
        defaultCurrent={1}
        total={pages.length * 100}
        onChange={onPageChange}
        pageSize={100}
        showSizeChanger={false}
        showQuickJumper
      />
    </div>
  );
};

const PaginationPage = connect(({ common }: { common: ICommon }) => ({
  curUser: common.curUser,
  manual_flag: common.judgeType,
}))(PagPage);

export default forwardRef((props: IPaginationPage, ref) => (
  <PaginationPage {...props} refInstance={ref} />
));
