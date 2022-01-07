import React from 'react';
import { Card, CardContent, Typography, Tooltip, ButtonBase } from '@material-ui/core';
import IconComponent from '../IconComponent/IconComponent';

interface RecognizedCardProps {
  inventory: any;
  onClick: () => void;
}

const RecognizedCard = ({ inventory, onClick }: RecognizedCardProps) => {
  console.log("INVENTORY",inventory);
  return (
    <>
      <Card id="RecognizedCard" className="component-card" elevation={1}>
        <ButtonBase onClick={() => onClick()}>
          <CardContent className="component-card-content">
            <IconComponent name={inventory.vendor} size={64} />
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
