import React from 'react';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import OpenInBrowserOutlinedIcon from '@material-ui/icons/OpenInBrowserOutlined';
import FindInPageOutlinedIcon from '@material-ui/icons/FindInPageOutlined';

import { IconButton, Tooltip, Typography } from '@material-ui/core';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import Label from '../Label/Label';

const { shell } = require('electron')

interface LabelCardProps {
  label: string | null;
  file: string | null;
  status: string | null;
}

const LabelCard = ({ label, file, status }: LabelCardProps) => {
  const onCopy = (path: string) => {
    navigator.clipboard.writeText(path);
  };

  const onOpen = (path: string) => {
    shell.showItemInFolder(path)
  };

  const onFind = (path: string) => {

  };

  const getFileName = (path: string) => {
    if (path) {
      const parts = path.split('/');
      return parts[parts.length - 1];
    }
    return '';
  };

  return (
    <div className={`label-card status-${status?.toLowerCase()}`}>
      <div className="label-card-content">
        <div className="label-div">
          <span className="label-title">{label}</span>
        </div>

        <div className='actions d-flex'>
          <Tooltip title="Find in file">
            <IconButton disableRipple size="small" className="btn-search" onClick={() => onFind(file)}>
              <FindInPageOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy file path to clipboard">
            <IconButton disableRipple size="small" className="btn-copy" onClick={() => onCopy(file)}>
              <FileCopyOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open file in folder">
            <IconButton disableRipple size="small" className="btn-open" onClick={() => onOpen(file)}>
              <OpenInBrowserOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default LabelCard;
