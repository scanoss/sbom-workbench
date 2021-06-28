import { Button, Paper } from '@material-ui/core';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { WorkbenchContext, IWorkbenchContext } from '../../WorkbenchProvider';
import { AppContext } from '../../../context/AppProvider';
import { inventoryService } from '../../../../api/inventory-service';
import { Inventory } from '../../../../api/types';

export const ComponentDetail = () => {
  const history = useHistory();

  const { scanBasePath } = useContext<any>(AppContext);

  const { component, setFile } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;

  const onSelectFile = (file: string) => {
    setFile(file);
    history.push(`/workbench/file/${file}`);
  };

  const onIdentifyAllPressed = async () => {
    if (!component) return;
    console.log(component);

    const inventory: Inventory = {
      purl: component.purl[0],
      url: component.url,
      notes: 'no notes',
      usage: 'file',
      license_name: component.licences[0]
        ? component.licences[0].name
        : 'no-data',
      files: component ? component.files : [],
    };
    const newInventory = await inventoryService.create(inventory);
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
    </>
  );
};

export default ComponentDetail;
