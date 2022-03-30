import React from 'react';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';

const NoLocalFile = () => (
  <div id="NoLocalFile">
    <InsertDriveFileOutlinedIcon style={{fontSize: 36}} />
    <p><small>This project was imported.<br></br>Source file can't be displayed.</small></p>
  </div>
);

export default NoLocalFile;
