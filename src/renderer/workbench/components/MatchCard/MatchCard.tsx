import React, { useContext } from 'react';
import CheckIcon from '@material-ui/icons/Check';
import BanIcon from '@material-ui/icons/NotInterested';
import IconButton from '@material-ui/core/IconButton';
import Label from '../Label/Label';
import { WorkbenchContext } from '../../WorkbenchProvider';

interface LabelType {
  labelOfCard: string | null;
  onClickCheck: boolean;
}

const MatchCard = ({ labelOfCard, status }) => {
  const { setInventoryBool } = useContext(WorkbenchContext);
  return (
    <div className={`match-card status-${status.toLowerCase()}`}>
      <div className="match-card-content">
        <div className="label-div">
          <Label label={labelOfCard} textColor="black" />
        </div>
        <div className="match-card-buttons">
          <CheckIcon
            onClick={() => setInventoryBool(true)}
            className="icon check"
          />
          <BanIcon className="icon ban" />
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
