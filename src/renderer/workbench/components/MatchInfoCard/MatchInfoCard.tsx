import React, { useEffect, useState } from 'react';
import CheckIcon from '@material-ui/icons/Check';
import BanIcon from '@material-ui/icons/NotInterested';
import RestoreOutlined from '@material-ui/icons/RestoreOutlined';
import componentDefault from '../../../../../assets/imgs/component-default.svg';
import DescriptionOutlined from '@material-ui/icons/DescriptionOutlined';
import IconButton from '@material-ui/core/IconButton';
import { Tooltip, Typography } from '@material-ui/core';

export enum MATCH_INFO_CARD_ACTIONS {
  ACTION_ENTER,
  ACTION_IDENTIFY,
  ACTION_IGNORE,
  ACTION_DETAIL,
  ACTION_RESTORE,
}

interface MatchInfoCardProps {
  match: Record<string, any>;
  selected: boolean;
  status: string;
  onSelect: () => void;
  onAction: (action: number) => void;
}

const MatchInfoCard = ({ match, onSelect, status, selected, onAction }: MatchInfoCardProps) => {

  return (
    <div onClick={onSelect}
         style={selected ? { borderBottom: '#60A5FA 2px solid', borderTop: '#60A5FA 2px solid', borderRight: '#60A5FA 2px solid' } : {} }
         className={`match-info-card status-${status}`}>
      <div className="match-info-card-content">
        <div className="label-info-div">
          <img alt="component logo" className="logo-match-info-card" src={componentDefault} />
          <span className="component-span">{match.component}</span>
          <span className="version-span">{match.version}</span>
          <div className="usage-div">
            {(status === 'pending' || status === 'ignored')  ? (
                <span className="usage-label">DETECTED</span>
            ) : (
                <span className="usage-label">USAGE</span>
            )}
            <span className="usage-id">{match.id}</span>
          </div>
        </div>
        <div className="match-info-card-buttons">
            {(status === 'pending') && (
              <>
                <Tooltip title="Identify">
                  <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_IDENTIFY)}>
                    <CheckIcon className="icon check"/>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Ignore">
                  <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_IGNORE)}>
                    <BanIcon className="icon ban"/>
                  </IconButton>
                </Tooltip>
              </>
            )}
            {(status === 'ignored') && (
              <>
                <Tooltip title="Restore">
                  <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_RESTORE)}>
                    <RestoreOutlined className="icon"/>
                  </IconButton>
                </Tooltip>
              </>
            )}
            {(status === 'identified') && (
              <>
              <Tooltip title="Ignore">
                <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_IGNORE)}>
                    <BanIcon />
                  </IconButton>
              </Tooltip>
              <Tooltip title="Details">
                <IconButton onClick={() => onAction(MATCH_INFO_CARD_ACTIONS.ACTION_DETAIL)}>
                  <DescriptionOutlined />
                </IconButton>
              </Tooltip>
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default MatchInfoCard;
