import { Pagination } from 'antd';
import { useState, useEffect } from 'react';
import * as db from './db';

import { forwardRef, useImperativeHandle } from 'react';
export interface IPaginationPage {
  setMaxId: (e: number) => void;
  refInstance: any;
}
const PagPage = ({ setMaxId, refInstance }: IPaginationPage) => {
  const [pages, setPages] = useState<{ pageNum: number; id: number }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    db.getImageClassPageIndex().then(setPages);
  }, []);

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
        justifyContent: 'flex-end',
        marginTop: 30,
      }}
    >
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

export default forwardRef((props: IPaginationPage, ref) => (
  <PagPage {...props} refInstance={ref} />
));
