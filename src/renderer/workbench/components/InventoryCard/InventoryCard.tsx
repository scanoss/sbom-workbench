import {
  Card,
  CardContent,
  Typography,
  ButtonBase, Chip, CardActions, Button
} from '@material-ui/core';
import React from 'react';
import { Inventory } from '../../../../api/types';

interface InventoryCardProps {
  inventory: Inventory;
  onSelect: (iventory) => void;
}

const InventoryCard = ({ inventory, onSelect }: InventoryCardProps) => {
  return (
    <>
      <Card className="inventory-card" elevation={1}>
        <ButtonBase onClick={() => onSelect(inventory)}>
          <CardContent className="inventory-card-content">
            <div className='d-flex space-between'>
              <div>
                <Typography component="h5" variant="subtitle1">
                  USAGE
                </Typography>
                <Typography component="h4" variant="h4">
                  {inventory.usage}
                </Typography>
              </div>
              <Chip label="Identified Group" />
            </div>

            <Typography paragraph>
              {inventory.notes}
            </Typography>

            <Typography component="h5" variant="button">
              Go to files
            </Typography>

          </CardContent>
        </ButtonBase>
      </Card>
    </>
  );
};

export default InventoryCard;
