import React from 'react';
import CheckIcon from '@material-ui/icons/Check';
import BanIcon from '@material-ui/icons/NotInterested';
import Label from '../Label/Label';

interface MatchCardProps {
  label: string | null;
  status: string | null;
  onClickCheck: () => void;
}

const MatchCard = ({ label, status, onClickCheck }: MatchCardProps) => {
  return (
    <div className={`match-card status-${status?.toLowerCase()}`}>
      <div className="match-card-content">
        <div className="label-div">
          <Label label={label} textColor="black" />
        </div>
        <div className="match-card-buttons">
          <CheckIcon onClick={onClickCheck} className="icon check" />
          <BanIcon className="icon ban" />
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
