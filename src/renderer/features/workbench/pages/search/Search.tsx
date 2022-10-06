import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FileViewer from '../detected/pages/FileViewer/FileViewer';
import EmptyMessagePlaceholder from '../../components/EmptyMessagePlaceholder/EmptyMessagePlaceholder';

const Search = () => {
  const { t } = useTranslation();
  return (
    <>
      <Routes>
        <Route
          index
          element={
            <EmptyMessagePlaceholder>{t('UseLeftPanelForSearch')}</EmptyMessagePlaceholder>
          }
        />
        <Route path="file" element={<FileViewer />} />
      </Routes>
    </>
  );
};

export default Search;
