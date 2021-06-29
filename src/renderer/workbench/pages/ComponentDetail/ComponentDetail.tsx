import { Button, Paper } from '@material-ui/core';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { WorkbenchContext, IWorkbenchContext } from '../../WorkbenchProvider';
import { AppContext } from '../../../context/AppProvider';
import { inventoryService } from '../../../../api/inventory-service';
import { Inventory } from '../../../../api/types';
import { InventoryDialog } from '../../components/InventoryDialog/InventoryDialog';

export const ComponentDetail = () => {
  const history = useHistory();

  const { scanBasePath } = useContext<any>(AppContext);

  const [open, setOpen] = useState<boolean>(false);

  const { component, setFile } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;

  const onSelectFile = (file: string) => {
    setFile(file);
    history.push(`/workbench/file/${file}`);
  };

  const onIdentifyAllPressed = async () => {
    setOpen(true);
  };

  const handleClose = async (inventory: Inventory) => {
    setOpen(false);
    const newInventory = await inventoryService.create({
      ...inventory,
      files: component ? component.files : [],
    });
    console.log(newInventory);
  };

  return (
    <>
      <section className="app-page">
        <header className="app-header">
          <h4 className="header-subtitle back">
            <IconButton onClick={() => history.goBack()} component="span">
              <ArrowBackIcon />
            </IconButton>
            {scanBasePath}
          </h4>

          <h1 className="header-title">
            <span className="color-primary">{component?.name}</span> matches
          </h1>

          <section>
            <Button
              variant="contained"
              color="secondary"
              onClick={onIdentifyAllPressed}
            >
              Identify All ({component?.files?.length})
            </Button>
          </section>
        </header>

        <main className="app-content">
          <section className="file-list">
            {component
              ? component.files.map((file) => (
                  <Paper
                    className="item"
                    onClick={() => onSelectFile(file)}
                    key={file}
                  >
                    {file}
                  </Paper>
                ))
              : null}
          </section>
        </main>
      </section>

      <InventoryDialog
        open={open}
        onClose={handleClose}
        component={component}
      />
    </>
  );
};

export default ComponentDetail;
