import React, { ReactNode } from 'react';
import { Card, CardContent, ButtonBase } from '@mui/material';
import { useSelector } from 'react-redux';
import { AuditSummaryCount } from '@api/types';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';

interface BaseCardProps {
  auditSummaryCount: AuditSummaryCount;
  children: ReactNode;
  onClick: () => void;
}

const BaseCard = ({ children, onClick, auditSummaryCount }: BaseCardProps) => {
  return (
    <Card
      className="base-card"
      elevation={1}
    >
      <ButtonBase className="base-card__button" onClick={() => onClick()}>
        <CardContent className="base-card__content">
          {children}

          <div className="base-card__files">
            {auditSummaryCount.identified !== 0 ? (
              <span className="info-count has-status-bullet identified">{auditSummaryCount.identified}</span>
            ) : null}
            {auditSummaryCount.pending !== 0 ? (
              <span className="info-count has-status-bullet pending">{auditSummaryCount.pending}</span>
            ) : null}
            {auditSummaryCount.ignored !== 0 ? (
              <span className="info-count has-status-bullet ignored">{auditSummaryCount.ignored}</span>
            ) : null}
          </div>
        </CardContent>
      </ButtonBase>
    </Card>
  );
};

export default BaseCard;
