import React, { useEffect } from 'react';
import CheckIcon from '@material-ui/icons/Check';
import BanIcon from '@material-ui/icons/NotInterested';
import Label from '../Label/Label';
import componentDefault from '../../../../../assets/imgs/component-default.svg';

interface MatchInfoCardProps {
  match: Record<string, any>;
  changeLines: () => void;
}

const MatchInfoCard = ({ match, changeLines }: MatchInfoCardProps) => {
  useEffect(() => {
    console.table(match);
  }, []);

  const onClickCheck = () => {
    console.log('onClickCheck');
  };

  return (
    <div onClick={changeLines} className={`match-info-card status-${match.status || 'pending'}`}>
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
              <BanIcon className="icon ban" />
            </>
          ) : (
            <>
              <CheckIcon onClick={onClickCheck} className="icon check" />
              <BanIcon className="icon ban" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchInfoCard;
