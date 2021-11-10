import { Pagination } from 'antd';
import { useState, useEffect } from 'react';
import * as db from './db';

export default ({ setMaxId }: { setMaxId: (e: number) => void }) => {
  const [pages, setPages] = useState<{ pageNum: number; id: number }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    db.getImageJudgePageIndex().then(setPages);
  }, []);
  const onPageChange = (page: number) => {
    setCurrentPage(page);
    setMaxId(pages[page - 1].id);
  };
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 30 }}>
      <Pagination
        current={currentPage}
        defaultCurrent={1}
        total={pages.length * 100}
        onChange={onPageChange}
        pageSize={100}
        pageSizeOptions={['100']}
      />
    </div>
  );
};
