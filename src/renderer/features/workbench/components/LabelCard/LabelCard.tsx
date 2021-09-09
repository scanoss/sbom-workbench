import React from 'react';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import { IconButton, Tooltip, Typography } from '@material-ui/core';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import Label from '../Label/Label';

interface LabelCardProps {
  label: string | null;
  status: string | null;
  subLabel: string | null;
}

const LabelCard = ({ label, status, subLabel }: LabelCardProps) => {
  const onCopy = (label: string) => {
    navigator.clipboard.writeText(label);
  };

  return (
    <div className={`label-card status-${status?.toLowerCase()}`}>
      <div className="label-card-content">
        <div className="label-div">
          <span className="label-title">{label}</span>
          <div className="directory-div">
            <AccountTreeIcon className="label-icon" />
            <Label label={subLabel} textColor="black" tooltip />
          </div>
        </div>
        <Tooltip title="Copy file path to clipboard">
          <IconButton size="small" className="btn-copy" onClick={() => onCopy(subLabel)}>
            <FileCopyOutlinedIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default LabelCard;
