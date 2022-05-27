import { useLocation } from 'react-router-dom';
import React from 'react';

const useSearchParams = () => {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
};

export default useSearchParams;
