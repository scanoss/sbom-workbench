import React from 'react';
import CheckIcon from '@material-ui/icons/Check';
import BanIcon from '@material-ui/icons/NotInterested';
import Label from '../Label/Label';

export enum MATCH_CARD_ACTIONS {
  ACTION_ENTER  ,
  ACTION_IDENTIFY,
  ACTION_IGNORE,
};

interface MatchCardProps {
  label: string | null;
  status: string | null;
  onAction: (action: number) => void;
}

const MatchCard = ({ label, status, onAction }: MatchCardProps) => {
  return (
    <div className={`match-card status-${status?.toLowerCase()}`}>
      <div className="match-card-content">
        <div onClick={() => onAction(MATCH_CARD_ACTIONS.ACTION_ENTER)} className="label-div">
          <Label label={label} textColor="black" />
        </div>
        <div className="match-card-buttons">
          {(status === 'pending') && (
            <>
              <CheckIcon onClick={() => onAction(MATCH_CARD_ACTIONS.ACTION_IDENTIFY)} className="icon check" />
              <BanIcon onClick={() => onAction(MATCH_CARD_ACTIONS.ACTION_IGNORE)} className="icon ban" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
