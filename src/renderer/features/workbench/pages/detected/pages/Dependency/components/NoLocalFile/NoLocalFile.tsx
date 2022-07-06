import React from 'react';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

const NoLocalFile = () => (
  <div id="NoLocalFile">
    <InsertDriveFileOutlinedIcon style={{fontSize: 36}} />
    <p><small>This project was imported.<br></br>Source file can't be displayed.</small></p>
  </div>
);

export default NoLocalFile;
