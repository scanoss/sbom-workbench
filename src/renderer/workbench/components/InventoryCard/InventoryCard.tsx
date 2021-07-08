import {
  Card,
  CardContent,
  Typography,
  ButtonBase, Chip, CardActions, Button
} from '@material-ui/core';
import React from 'react';
import { Inventory } from '../../../../api/types';
import Label from '../Label/Label';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

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
            <header className='header d-flex space-between'>
              <div>
                <Label label="USAGE" textColor="gray" />
                <Typography component="h5" variant="h5">{inventory.usage}</Typography>
              </div>
              <Chip className="identified" variant="outlined" label="Identified Group" />
            </header>

            <Typography paragraph>
              {inventory.notes}
            </Typography>

            <footer>
              <div className="link">Go to files   <ArrowForwardIcon /></div>
            </footer>
          </CardContent>
        </ButtonBase>
      </Card>
    </>
  );
};

export default InventoryCard;
