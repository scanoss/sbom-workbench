import React from 'react';
import CheckIcon from '@material-ui/icons/Check';
import BanIcon from '@material-ui/icons/NotInterested';
import Label from '../Label/Label';
import { Tooltip } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import RestoreOutlined from '@material-ui/icons/RestoreOutlined';

export enum MATCH_CARD_ACTIONS {
  ACTION_ENTER  ,
  ACTION_IDENTIFY,
  ACTION_IGNORE,
  ACTION_RESTORE,
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
              <Tooltip title="Identify">
                <IconButton onClick={() => onAction(MATCH_CARD_ACTIONS.ACTION_IDENTIFY)}>
                  <CheckIcon className="icon check"/>
                </IconButton>
              </Tooltip>
              <Tooltip title="Ignore">
                <IconButton onClick={() => onAction(MATCH_CARD_ACTIONS.ACTION_IGNORE)}>
                  <BanIcon className="icon ban"/>
                </IconButton>
              </Tooltip>
            </>
          )}
          {(status === 'ignored') && (
            <>
              <Tooltip title="Restore">
                <IconButton onClick={() => onAction(MATCH_CARD_ACTIONS.ACTION_RESTORE)}>
                  <RestoreOutlined className="icon"/>
                </IconButton>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
