import React from 'react';
import { Route, Routes } from 'react-router-dom';
import FileViewer from '../detected/pages/FileViewer/FileViewer';
import EmptyMessagePlaceholder from '../../components/EmptyMessagePlaceholder/EmptyMessagePlaceholder';

const Search = () => {
  return (
    <>
      <Routes>
        <Route
          index
          element={
            <EmptyMessagePlaceholder>Use left panel for search keywords inside the files.</EmptyMessagePlaceholder>
          }
        />
        <Route path="file" element={<FileViewer />} />
      </Routes>
    </>
  );
};

export default Search;
