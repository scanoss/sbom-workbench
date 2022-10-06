import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  ButtonBase, Chip, CardActions, Button
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Inventory } from '@api/types';
import { useTranslation } from 'react-i18next';
import Label from '../Label/Label';

interface InventoryCardProps {
  inventory: Inventory;
  onSelect: (iventory) => void;
}

const InventoryCard = ({ inventory, onSelect }: InventoryCardProps) => {
  const { t } = useTranslation();
  return (
    <>
      <Card className="inventory-card" elevation={1}>
        <ButtonBase onClick={() => onSelect(inventory)}>
          <CardContent className="inventory-card-content">
            <header className="header">
              <section className="info">
                <div>
                  <Label label={t('Title:Usage').toUpperCase()} textColor="gray" />
                  <Typography component="p">{inventory.usage}</Typography>
                </div>
                <div>
                  <Label label={t('Title:version').toUpperCase()} textColor="gray" />
                  <Typography component="p">{inventory.component.version}</Typography>
                </div>
                <div>
                  <Label label={t('Title:License').toUpperCase()} textColor="gray" />
                  <Typography component="p">{inventory.license_name}</Typography>
                </div>
              </section>
              <Chip className="identified" variant="outlined" label={t('Title:IdentifiedGroup')} />
            </header>

            <Typography paragraph className="notes">
              {inventory.notes}
            </Typography>

            <footer>
              <div className="link">{t('Title:Viewfiles')} <ArrowForwardIcon /></div>
            </footer>
          </CardContent>
        </ButtonBase>
      </Card>
    </>
  );
};

export default InventoryCard;
