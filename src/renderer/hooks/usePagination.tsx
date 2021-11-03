import React, { useState } from 'react';

const usePagination = (pageSize = 80) => {
  const [page, setPage] = useState(1);
  const limit = page * pageSize;

  const paginate = () => {
    setPage(page + 1);
  };

  const onScroll = (e) => {
    const isBottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
    if (isBottom) {
      paginate();
    }
  };

  return {
    page,
    limit,
    paginate,
    onScroll,
  };
};

export default usePagination;
