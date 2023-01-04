import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Button, CircularProgress,
  Dialog,
  DialogContent, FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Switch
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import Alert from '@mui/material/Alert';
import { useDispatch, useSelector } from 'react-redux';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { selectWorkspaceState } from '@store/workspace-store/workspaceSlice';
import { DataGrid } from '@mui/x-data-grid';
import {
  InventoryKnowledgeExtraction,
  InventorySourceType,
  IProject,
} from '@api/types';
import { projectService } from '@api/services/project.service';
import { DialogContext } from '@context/DialogProvider';
import { acceptInventoryKnowledge } from '@store/inventory-store/inventoryThunks';
import useApi from '@hooks/useApi';
import {
  AutoSizer,
  Column,
  Table,
  TableHeaderProps,
} from 'react-virtualized';
import IconComponent from '../../features/workbench/components/IconComponent/IconComponent';



const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: 700,
    },

    '& .MuiGrid-root': {
      height: 280
    }
  },
  selector: {
    width: '100%',
    justifyContent: 'space-between',
    '& .form-group': {
      width: 400,
    },
  },
  left: {
    height: '100%',
  },

  headerColumn: {
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: '1.5rem',
    color: 'rgba(0, 0, 0, 0.87)',
    textTransform: 'capitalize',
    height: '100%',
    alignItems: 'center',
    display: 'flex',
  },

  row: {
    fontWeight: 400,
    fontSize: '0.75rem',
    borderBottom: '1px solid rgba(224, 224, 224, 1)',
    color: 'rgba(0, 0, 0, 0.87)',
  },

  dataGrid: {
    border: 0,

    '& .MuiDataGrid-row': {
      background: 'white',
      margin: '2px 0',
      border: 0,
    },

    '& .MuiDataGrid-cell': {
      border: 0,
      outline: '0 !important',
    },

    '& .MuiDataGrid-columnHeaders': {
      border: 0,
      outline: '0 !important',
    },

  },
  dataResults: {
    maxHeight: 250,

    '& .file-cell': {
      width: 300,
      display: 'flex',
    },

    '& .file': {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },

    '& .component-name-cell': {
      display: 'flex',
      alignItems: 'center',
      fontWeight: 500,
      color: '#3B82F6',
      fontSize: 'inherit',

      '& h3': {
        margin: 0,
        marginLeft: 3
      }
    },
    '& .MuiTableCell-root': {
      fontSize: 14,
      fontWeight: 500,
    }
  }
}));

interface IProjectSelectorDialog {
  open: boolean;
  params: { folder?: string, md5File?: string };
  onClose: (response: any) => void;
  onCancel: () => void;
}

export const ProjectSelectorDialog = (props: IProjectSelectorDialog) => {
  const classes = useStyles();
  const dialogCtrl = useContext<any>(DialogContext);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { data, error, loading, execute } = useApi<InventoryKnowledgeExtraction>();

  const { open,  params, onClose, onCancel } = props;

  const steps = [t('Title:SelectProjects'), t('Title:PreviewIdentifications')];
  const [activeStep, setActiveStep] = React.useState(0);
  const [override, setOverride] = React.useState<boolean>(true);


  const { projects, currentProject } = useSelector(selectWorkspaceState);
  const { isFilterActive } = useSelector(selectNavigationState);
  const projectsList = useRef<IProject[]>(
    projects
      .filter((item) => item.uuid !== currentProject?.uuid)
      .map((item) => ({...item, id: item.uuid}))
      .sort((a, b) => a.name - b.name)
  );

  const [selected, setSelected] = React.useState<string[]>([]);
  const [items, setItems] = React.useState<any[]>([]);

  const preview = async () => {
    const set = new Set(selected);
    const projectsSelected = projectsList.current.filter((r) => set.has(r.uuid));

    await execute( () => projectService.extractInventoryKnowledge({
      override,
      folder: params?.folder,
      md5File: params?.md5File,
      source: [...projectsSelected],
      target: {...currentProject},
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    const dialog = await dialogCtrl.createProgressDialog(t('Title:ImportingIdentifications'));
    try {
      dialog.present();
      await dispatch(acceptInventoryKnowledge({
        inventoryKnowledgeExtraction: data,
        overwrite: override,
        type: InventorySourceType.PATH,
        path: params?.folder
      }))
      onClose({ });
    } catch (e) {
      console.log(e);
    } finally {
      dialog.dismiss();
    }
  };

  const onSelectionHandler = (data, details) => {
    setSelected(data);
  };

  const handleNext = async () => {
    await preview();
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const isValid = () => {
    return data && Object.keys(data).length && !loading;
  };

  useEffect(() => {
    const newItems = [];
    if (data) {
      Object.keys(data).forEach(key => {
        data[key].inventories.forEach(inv => {
          newItems.push({key, files: data[key].localFiles.join(', '), ...inv})
        });
      });
    }
    setItems(newItems);

  }, [data]);

  useEffect(() => {
    if (activeStep !== 0 ) preview()
  }, [override])

  return (
    <Dialog
      id="ProjectSelectorDialog"
      open={open}
      maxWidth="md"
      scroll="body"
      fullWidth
      onClose={onCancel}
      className={`${classes.size} dialog`}
    >
      <header className="dialog-title">
        <span>{t('Title:ImportFromProjects')}</span>
        <IconButton aria-label="close" tabIndex={-1} onClick={onCancel} size="large">
          <CloseIcon />
        </IconButton>
      </header>

      <DialogContent>
        {isFilterActive && (
          <Alert className="mt-1 mb-3" severity="info">
            {t('ActionCurrentFilterCriteria')}
          </Alert>
        )}

        <Stepper className="mb-5" activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: {
              optional?: React.ReactNode;
            } = {};

            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>


        {activeStep === 0 && (
          <Grid >
          <div className={`${classes.left}`}>
            <DataGrid
              className={classes.dataGrid}
              rows={projectsList.current}
              columns={[
                {
                  field: 'name',
                  headerName: t('NProjectsSelected', { count: selected.length}),
                  editable: false,
                  sortable: false,
                  flex: 1,
                },
              ]}
              rowHeight={40}
              disableColumnMenu
              rowsPerPageOptions={[100]}
              hideFooter
              checkboxSelection
              headerHeight={41}
              selectionModel={selected}
              onSelectionModelChange={onSelectionHandler}
            />
          </div>
        </Grid>
        )}

        {activeStep === 1 && (
          <Grid >
              <div className="list-container">

                <header className="d-flex space-between mt-1">
                  <div className="ml-2 font-medium">{t('NProjectsSelected', { count: selected.length})}</div>

                  <div>
                    <FormControlLabel
                      className="override-toggle-switch ml-1 mb-2"
                      control={
                        <Switch
                          onChange={(e) => setOverride(e.target.checked)}
                          checked={override}
                          size="small"
                          color="primary"
                        />
                      }
                      label={<small>{t('OverridePreviousWork')}</small>}
                    />
                  </div>
                </header>

                <Paper style={{ height: 250, width: '100%', overflow: 'hidden' }}>
                  <>
                  <AutoSizer>
                  {({ height, width }) => (
                    <Table
                      height={height}
                      width={width}
                      rowHeight={28}
                      headerHeight={40}
                      rowCount={items.length}
                      rowGetter={({index}) => items[index]}
                      headerClassName={classes.headerColumn}
                      rowClassName={classes.row}
                    >
                      <Column label={t('Table:Header:LocalFile')} dataKey="files" width={250} flexGrow={0} flexShrink={0} />
                      <Column label={t('Table:Header:Component')} dataKey="name" width={100} flexGrow={0} flexShrink={0} />
                      <Column label={t('Table:Header:PURL')} dataKey="purl" />
                      <Column label={t('Table:Header:Version')} dataKey="version" width={70} flexGrow={0} flexShrink={0}/>
                      <Column label={t('Table:Header:License')} dataKey="spdxid"  width={70} flexGrow={0} flexShrink={0} />
                    </Table>
                  )}
                  </AutoSizer>

                  {items.length === 0 &&
                      <div className="text-center mt-10 pt-10">
                        {t('Title:NoMatchFound')}
                      </div>
                  }
                  </>
                </Paper>
              </div>
          </Grid>
        )}

        <hr className="divider" />

        <form onSubmit={onSubmit}>

            { activeStep === 0 && (
              <div className="button-container">
                <Button type="button" variant="contained" color="secondary" onClick={handleNext} disabled={loading || selected.length === 0}>
                  { loading && <CircularProgress className="mr-2" size={18} /> }
                  {t('Button:Next')}
                </Button>
              </div>
            )}

            { activeStep === 1 && (
              <div className="button-container space-between">
                  <Button className="ml-0" color="inherit" tabIndex={-1} onClick={handleBack}>{t('Button:Back')}</Button>
                  <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
                    {t('Button:Import')}
                  </Button>
              </div>
              )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSelectorDialog;
