import {
  Card,
  CardContent,
  Typography,
  ButtonBase, Chip, CardActions, Button
} from '@material-ui/core';
import React from 'react';
import { Inventory } from '../../../../../api/types';
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
            <header className="header">
              <section className="info">
                <div>
                  <Label label="USAGE" textColor="gray" />
                  <Typography component="p">{inventory.usage}</Typography>
                </div>
                <div>
                  <Label label="VERSION" textColor="gray" />
                  <Typography component="p">{inventory.version}</Typography>
                </div>
                <div>
                  <Label label="LICENSE" textColor="gray" />
                  <Typography component="p">{inventory.license_name}</Typography>
                </div>
              </section>
              <Chip className="identified" variant="outlined" label="Identified Group" />
            </header>

            <Typography paragraph className="notes">
              {inventory.notes}
            </Typography>

            <footer>
              <div className="link">View files   <ArrowForwardIcon /></div>
            </footer>
          </CardContent>
        </ButtonBase>
      </Card>
    </>
  );
};

export default InventoryCard;
