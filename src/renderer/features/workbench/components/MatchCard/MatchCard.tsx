import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import BanIcon from '@mui/icons-material/NotInterested';
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import RestoreOutlined from '@mui/icons-material/RestoreOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import Label from '../Label/Label';

export enum MATCH_CARD_ACTIONS {
  ACTION_ENTER,
  ACTION_IDENTIFY,
  ACTION_IGNORE,
  ACTION_RESTORE,
  ACTION_DETACH,
  ACTION_DETAIL,
}

interface MatchCardProps {
  label: string | null;
  status: string | null;
  type: string | null;
  onAction: (action: number) => void;
}

const MatchCard = ({ label, status, onAction, type }: MatchCardProps) => {
  const [isShow, setIsShow] = React.useState(false);

  return (
    <div
      onMouseOver={() => setIsShow(true)}
      onFocus={() => setIsShow(true)}
      className={`match-card status-${status?.toLowerCase()}`}
    >
      <div className="match-card-content">
        <div onClick={() => onAction(MATCH_CARD_ACTIONS.ACTION_ENTER)} className="label-div">
          <Label label={label} textColor="black" />
        </div>
        <div className="match-card-buttons">
          {status === 'pending' && isShow && (
            <>
              <span className="type">{type}</span>
              <IconButton title="Identify" size="small" onClick={() => onAction(MATCH_CARD_ACTIONS.ACTION_IDENTIFY)}>
                <CheckIcon className="icon check" fontSize="inherit" />
              </IconButton>
              <IconButton title="Mark as original" size="small" onClick={() => onAction(MATCH_CARD_ACTIONS.ACTION_IGNORE)}>
                <BanIcon className="icon ban" fontSize="inherit" />
              </IconButton>
            </>
          )}
          {status === 'ignored' && isShow && (
            <>
              <IconButton title="Restore" size="small" onClick={() => onAction(MATCH_CARD_ACTIONS.ACTION_RESTORE)}>
                <RestoreOutlined className="icon" fontSize="inherit" />
              </IconButton>
            </>
          )}
          {status === 'identified' && isShow && (
            <>
              <IconButton title="Remove identification" size="small" onClick={() => onAction(MATCH_CARD_ACTIONS.ACTION_DETACH)}>
                <RestoreOutlined className="icon" fontSize="inherit" />
              </IconButton>
              <IconButton title="View identification" size="small" onClick={() => onAction(MATCH_CARD_ACTIONS.ACTION_DETAIL)}>
                <DescriptionOutlined fontSize="inherit" />
              </IconButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
