import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EmptyMessagePlaceholder from '../../components/EmptyMessagePlaceholder/EmptyMessagePlaceholder';
import CryptoViewer from '../../components/CryptoViewer/CryptoViewer';

const CryptoSearch = () => {
  const { t } = useTranslation();
  return (
    <>
      <Routes>
        <Route
          index
          element={
            <EmptyMessagePlaceholder>{t('UseLeftPanelForSearchCryptography')}</EmptyMessagePlaceholder>
          }
        />
        <Route path='file/*' element={<CryptoViewer/>} />
      </Routes>
    </>
  );
};

export default CryptoSearch;
