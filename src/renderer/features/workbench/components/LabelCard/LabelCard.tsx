import React from 'react';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import { IconButton, Tooltip, Typography } from '@material-ui/core';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import Label from '../Label/Label';

interface LabelCardProps {
  label: string | null;
  file: string | null;
  status: string | null;
}

const LabelCard = ({ label, file, status }: LabelCardProps) => {
  const onCopy = (label: string) => {
    navigator.clipboard.writeText(label);
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
          <Tooltip title={file || ''}>
            <div className="directory-div">
              <AccountTreeIcon className="label-icon" />
              <Label label={getFileName(file)} textColor="black" />
            </div>
          </Tooltip>
        </div>
        <Tooltip title="Copy file path to clipboard">
          <IconButton size="small" className="btn-copy" onClick={() => onCopy(file)}>
            <FileCopyOutlinedIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default LabelCard;
