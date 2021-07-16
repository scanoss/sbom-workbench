import React from 'react';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import Label from '../Label/Label';

interface LabelCardProps {
  label: string | null;
  status: string | null;
  subLabel: string | null;
}

const LabelCard = ({ label, status, subLabel }: LabelCardProps) => {
  return (
    <div className={`label-card status-${status?.toLowerCase()}`}>
      <div className="label-card-content">
        <div className="label-div">
          <span className="label-title">{label}</span>
          <div className="directory-div">
            <AccountTreeIcon className="label-icon" />
            <Label fontTamaño="16px" label={subLabel} textColor="black" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelCard;
