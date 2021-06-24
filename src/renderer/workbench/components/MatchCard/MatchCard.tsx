import React from 'react';
import CheckIcon from '@material-ui/icons/Check';
import BanIcon from '@material-ui/icons/NotInterested';
import Label from '../Label/Label';

interface LabelType {
  labelOfCard: string | null;
}

const MatchCard = ({ labelOfCard, status }) => {
  //
  return (
    <div className={`match-card status-${status.toLowerCase()}`}>
      <div className="match-card-content">
        <div className="label-div">
          <Label label={labelOfCard} textColor="black" />
        </div>
        <div className="match-card-buttons">
          <CheckIcon className="icon check" />
          <BanIcon className="icon ban" />
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
