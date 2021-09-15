import React, { useEffect, useState } from 'react';
import CheckIcon from '@material-ui/icons/Check';
import BanIcon from '@material-ui/icons/NotInterested';
import RestoreOutlined from '@material-ui/icons/RestoreOutlined';
import DescriptionOutlined from '@material-ui/icons/DescriptionOutlined';
import IconButton from '@material-ui/core/IconButton';
import { Tooltip } from '@material-ui/core';
import componentDefault from '../../../../../../assets/imgs/component-default.svg';

export enum MATCH_INFO_CARD_ACTIONS {
  ACTION_ENTER,
  ACTION_IDENTIFY,
  ACTION_IGNORE,
  ACTION_DETAIL,
  ACTION_RESTORE,
  ACTION_DETACH,
}

interface MatchInfoCardProps {
  match: {
    component: string;
    version: string;
    usage: string;
    license: string;
    url: string;
    purl: string;
  };
  selected: boolean;
  status: string;
  onSelect: () => void;
  onAction: (action: number) => void;
}

const MatchInfoCard = ({ match, onSelect, status, selected, onAction }: MatchInfoCardProps) => {
  const [over, setOver] = useState<boolean>(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = React.useRef();

  const handlerOpen = (e) => {
    const refParent = document.querySelector('#editor .content');
    const x = ref.current.getBoundingClientRect().left - refParent.getBoundingClientRect().left;
    const y = ref.current.getBoundingClientRect().top - refParent.getBoundingClientRect().top + 62;

    setPos({ x, y });
    setOver(true);
  };

  return (
    <>
      <article className="match-info-card-container" ref={ref}>
        <div onClick={onSelect} style={selected ? { border: '#60A5FA 2px solid' } : {}} className="match-info-card">
          <div className={`match-info-card-content status-${status}`}>
            <div onMouseEnter={handlerOpen} onMouseLeave={() => setOver(false)} className="label-info-div">
              <img alt="component logo" className="logo-match-info-card" src={componentDefault} />
              <span className="component-span">{match.component}</span>
              <span className="version-span">{match.version}</span>
              <div className="usage-div">
                {status === 'pending' || status === 'ignored' ? (
                  <span className="usage-label">DETECTED</span>
                ) : (
                  <span className="usage-label">USAGE</span>
                )}
                <span className="usage-value">{match.usage}</span>
              </div>
            </div>
            <div className="match-info-card-buttons">
              {status === 'pending' && (
                <>
                  <Tooltip title="Identify">
                    <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_IDENTIFY)}>
                      <CheckIcon className="icon check" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Ignore">
                    <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_IGNORE)}>
                      <BanIcon className="icon ban" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {status === 'ignored' && (
                <>
                  <Tooltip title="Restore">
                    <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_RESTORE)}>
                      <RestoreOutlined className="icon" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {status === 'identified' && (
                <>
                  <Tooltip title="Remove identification">
                    <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_DETACH)}>
                      <RestoreOutlined className="icon" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View identification">
                    <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_DETAIL)}>
                      <DescriptionOutlined />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </div>

        {over && (
          <div
            className="popover-container"
            style={{ top: pos.y, left: pos.x }}
            onMouseEnter={() => setOver(true)}
            onMouseLeave={() => setOver(false)}
          >
            <div className="component-details-matchinfo">
              <div className="tiny-container-detail-matchinfo">
                <p className="title-detail-matchinfo">License</p>
                <p className="desc-detail-matchinfo">{match?.license}</p>
              </div>
              <div className="tiny-container-detail-matchinfo">
                <p className="title-detail-matchinfo">PURL</p>
                <p className="desc-detail-matchinfo">{match?.purl}</p>
              </div>
              <div className="tiny-container-detail-matchinfo">
                <p className="title-detail-matchinfo">URL</p>
                <a href={match?.url} target="_blank" className="desc-detail-matchinfo url-matchinfo" rel="noreferrer">
                  {match?.url}
                </a>
              </div>
            </div>
          </div>
        )}
      </article>
    </>
  );
};

export default MatchInfoCard;
