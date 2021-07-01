import { Button } from '@material-ui/core';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { WorkbenchContext, IWorkbenchContext } from '../../WorkbenchProvider';
import { AppContext } from '../../../context/AppProvider';
import { InventoryDialog } from '../../components/InventoryDialog/InventoryDialog';
import MatchCard from '../../components/MatchCard/MatchCard';
import Label from '../../components/Label/Label';
import Title from '../../components/Title/Title';
import { Inventory } from '../../../../api/types';

export const ComponentDetail = () => {
  const history = useHistory();

  const { scanBasePath } = useContext<any>(AppContext);

  const [open, setOpen] = useState<boolean>(false);

  const { component, setFile, scan, createInventory } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;

  const onSelectFile = (file: string) => {
    history.push(`/workbench/file/${file}`);
    setFile(file);
  };

  const onIdentifyAllPressed = async () => {
    setOpen(true);
  };

  const handleClose = async (inventory: Inventory) => {
    setOpen(false);
    const newInventory = {
      ...inventory,
      files: component ? component.files : [],
    };
    const response = await createInventory(newInventory);
    console.log(response);
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

          <section className="subheader">
            <div className="component-info">
              <div>
                <Label label="COMPONENT" textColor="gray" />
                <Title title={component?.name} />
              </div>
              <div>
                <Label label="VENDOR" textColor="gray" />
                <Title title={component?.vendor} />
              </div>
              <div>
                <Label label="VERSION" textColor="gray" />
                <Title title={component?.version} />
              </div>
              <div>
                <Label label="LICENSE" textColor="gray" />
                <Title
                  title={
                    component?.licenses && component.licenses[0]
                      ? component?.licenses[0].name
                      : '-'
                  }
                />
              </div>
            </div>

            <Button
              variant="contained"
              color="secondary"
              onClick={onIdentifyAllPressed}
            >
              Identify All ({component?.count.all})
            </Button>
          </section>
        </header>

        <main className="app-content">
          <section className="file-list">
            {component
              ? component.files.map((file) => (
                  <article
                    className="item"
                    key={file}
                    onClick={() => onSelectFile(file)}
                  >
                    <MatchCard
                      labelOfCard={file}
                      status={
                        scan && scan[file][0]?.status
                          ? scan[file][0].status
                          : 'pending'
                      }
                    />
                  </article>
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
