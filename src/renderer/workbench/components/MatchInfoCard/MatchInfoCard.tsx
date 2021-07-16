import React, { useEffect, useState } from 'react';
import CheckIcon from '@material-ui/icons/Check';
import BanIcon from '@material-ui/icons/NotInterested';
import componentDefault from '../../../../../assets/imgs/component-default.svg';

export enum MATCH_INFO_CARD_ACTIONS {
  ACTION_ENTER,
  ACTION_IDENTIFY,
  ACTION_IGNORE,
}

interface MatchInfoCardProps {
  match: Record<string, any>;
  changeLines: () => void;
  onAction: (action: number) => void;
  style: any;
}

const MatchInfoCard = ({ match, changeLines, style, onAction }: MatchInfoCardProps) => {
  useEffect(() => {
    console.table(match);
  }, []);

  const onClickCheck = () => {
    console.log('onClickCheck');
  };

  const handleClickCard = () => {
    changeLines();
  };

  return (
    <div onClick={handleClickCard} style={style} className={`match-info-card status-${match.status || 'pending'}`}>
      <div className="match-info-card-content">
        <div className="label-info-div">
          <img alt="component logo" className="logo-match-info-card" src={componentDefault} />
          <span className="component-span">{match.component}</span>
          <span className="version-span">{match.version}</span>
          <div className="usage-div">
            {match.status === 'pending' ? (
              <>
                <span className="usage-label">USAGE</span>
              </>
            ) : (
              <>
                <span className="usage-label">DETECTED</span>
              </>
            )}
            <span className="usage-id">Snippet</span>
          </div>
        </div>
        <div className="match-info-card-buttons">
          {match.status === 'pending' ? (
            <>
              <BanIcon onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_IGNORE)} className="icon ban" />
            </>
          ) : (
            <>
              <CheckIcon onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_IDENTIFY)} className="icon check" />
              <BanIcon onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_IGNORE)} className="icon ban" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchInfoCard;
