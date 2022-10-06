import React, { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import BanIcon from '@mui/icons-material/NotInterested';
import RestoreOutlined from '@mui/icons-material/RestoreOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import IconButton from '@mui/material/IconButton';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import IconComponent from '../IconComponent/IconComponent';

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
    vendor: string;
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
  const { t } = useTranslation();
  const [over, setOver] = useState<boolean>(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = React.useRef<any>();

  const handlerOpen = (e) => {
    const refParent = document.querySelector('#editor .content');
    const x = ref?.current.getBoundingClientRect().left - refParent.getBoundingClientRect().left;
    const y = ref?.current.getBoundingClientRect().top - refParent.getBoundingClientRect().top + 62;

    setPos({ x, y });
    setOver(true);
  };

  return (
    <>
      <article id="MatchInfoCard" ref={ref}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <div onClick={onSelect} style={selected ? { border: '#60A5FA 1px solid' } : {}} className="match-info-card">
          <div className={`match-info-card-content status-${status}`}>
            {(status === 'pending' || status === 'identified') && (
              <div onMouseEnter={handlerOpen} onMouseLeave={() => setOver(false)} className="label-info">
                <IconComponent name={match.vendor} size={32} />
                <span className="component-name">{match.component}</span>
                <span className="match-info-data version">
                  <span className="label">{t('Title:Version')}</span>
                  <span className="value">{match.version}</span>
                </span>
                <div className="match-info-data usage">
                  {status === 'pending' && <span className="label">{t('Title:Detected')}</span>}
                  {status === 'identified' && <span className="label">{t('Title:Usage')}</span>}
                  <span className="value">{match.usage}</span>
                </div>
              </div>
            )}

            {status === 'ignored' && (
              <div className="label-info original">
                <IconComponent name={match.vendor} size={32} />
                <span className="component-span">{match.component}</span>
                <span className="match-info-data version">
                  <span className="label">{t('Title:Version')}</span>
                  <span className="value">{match.version}</span>
                </span>
                <div className="match-info-data usage">
                  <span className="label">{t('Title:Usage')}</span>
                  <span className="value">{match.usage}</span>
                </div>
              </div>
            )}

            <div className="match-info-card-buttons">
              {status === 'pending' && (
                <>
                  <Tooltip title={t('Tooltip:Identify')}>
                    <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_IDENTIFY)} size="large">
                      <CheckIcon className="icon check" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('Tooltip:MarkAsOriginal')}>
                    <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_IGNORE)} size="large">
                      <BanIcon className="icon ban" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {status === 'ignored' && (
                <>
                  <Tooltip title={t('Tooltip:Restore')}>
                    <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_RESTORE)} size="large">
                      <RestoreOutlined className="icon" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {status === 'identified' && (
                <>
                  <Tooltip title={t('Tooltip:RemoveIdentification')}>
                    <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_DETACH)} size="large">
                      <RestoreOutlined className="icon" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('Tooltip:ViewIdentification')}>
                    <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_DETAIL)} size="large">
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
            className="popover-container selectable"
            style={{ top: pos.y, left: pos.x }}
            onMouseEnter={() => setOver(true)}
            onMouseLeave={() => setOver(false)}
          >
            <div className="component-details-matchinfo">
              <div className="tiny-container-detail-matchinfo">
                <p className="title-detail-matchinfo">{t('Title:License')}</p>
                <p className="desc-detail-matchinfo">{match?.license || '-'}</p>
              </div>
              <div className="tiny-container-detail-matchinfo">
                <p className="title-detail-matchinfo">{t('Title:PURL')}</p>
                <p className="desc-detail-matchinfo">{match?.purl}</p>
              </div>
              <div className="tiny-container-detail-matchinfo">
                <p className="title-detail-matchinfo">{t('Title:URL')}</p>
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
