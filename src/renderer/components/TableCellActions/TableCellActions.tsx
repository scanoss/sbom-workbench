import React from 'react';
import { TableCell } from '@mui/material';

const TableCellActions = ({ children }) => {
  return (
    <TableCell>
      <div className="d-flex flex-end" style={{ gap: 5 }}>{children}</div>
    </TableCell>
  );
};

export default TableCellActions;
