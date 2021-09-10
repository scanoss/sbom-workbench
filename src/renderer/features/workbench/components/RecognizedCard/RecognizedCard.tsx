import React from 'react';
import { Card, CardContent, Typography, Tooltip, ButtonBase } from '@material-ui/core';
import componentDefault from '../../../../../../assets/imgs/component-default.svg';
import { ComponentGroup } from '../../../../../api/types';

interface RecognizedCardProps {
  inventory: any;
  onClick: () => void;
}

const RecognizedCard = ({ inventory, onClick }: RecognizedCardProps) => {

  return (
    <>
      <Card id="RecognizedCard" className="component-card" elevation={1}>
        <ButtonBase onClick={() => onClick()}>
          <CardContent className="component-card-content">
            <figure>
              <img alt="component logo" src={componentDefault} />
            </figure>
            <div className="component-card-info">
              <p> {inventory.inventories.length} groups </p>
              <Tooltip title={inventory.component}>
                <Typography variant="h6" gutterBottom>
                  {inventory.component}
                </Typography>
              </Tooltip>
            </div>
          </CardContent>
        </ButtonBase>
      </Card>
    </>
  );
};

export default RecognizedCard;
