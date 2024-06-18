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
  const state = useSelector(selectWorkbench);

  const override: boolean = false; // TODO: Investigate what is this for

  return (
    <Card
      className={`
          base-card
          ${override && 'override'}
        `}
      elevation={1}
    >
      <ButtonBase onClick={() => onClick()}> {/* TODO: Define how to pass the onClick Callback */}
        <CardContent className="base-card-content">
          {children}
          <div className={`base-card-files ${state.filter?.status || 'no-status-filter'}`}>
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
