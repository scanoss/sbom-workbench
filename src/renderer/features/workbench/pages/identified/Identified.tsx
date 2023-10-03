import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { InventoryDetail } from './pages/InventoryDetail/InventoryDetail';
import { InventoryList } from './pages/InventoryList/InventoryList';
import { IdentifiedList } from './pages/IdentifiedList/IdentifiedList';

const Identified = () => (
  <Routes>
    <Route index element={<IdentifiedList />} />
    <Route path="inventory" element={<InventoryList />} />
    <Route path="inventory/:id" element={<InventoryDetail />} />
  </Routes>
);

export default Identified;
