import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent, FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Step,
  StepLabel,
  Stepper, Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import Alert from '@mui/material/Alert';
import { useDispatch, useSelector } from 'react-redux';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import CloseIcon from '@mui/icons-material/Close';
import { Trans, useTranslation } from 'react-i18next';
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

  const { open,  params, onClose, onCancel } = props;

  const steps = [t('Title:SelectProjects'), t('Title:PreviewIdentifications')];
  const [activeStep, setActiveStep] = React.useState(0);
  const [override, setOverride] = React.useState<boolean>(true);


  const { projects, currentProject } = useSelector(selectWorkspaceState);
  const { isFilterActive } = useSelector(selectNavigationState);
  const [items, setItems] = useState<IProject[]>(
    projects
      .filter((item) => item.uuid !== currentProject.uuid)
      .map((item) => ({...item, id: item.uuid}))
      .sort((a, b) => a.name - b.name)
  );
  const [results, setResults] = useState<InventoryKnowledgeExtraction>(null)
  const [selected, setSelected] = React.useState<string[]>([]);

  const preview = async () => {
    const set = new Set(selected);
    const projectsSelected = items.filter((r) => set.has(r.uuid));

    const response = await projectService.extractInventoryKnowledge({
      override,
      folder: params?.folder,
      md5File: params?.md5File,
      source: [...projectsSelected],
      target: {...currentProject},
    });

    setResults(response)
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    const dialog = await dialogCtrl.createProgressDialog(t('Title:ImportingIdentifications'));
    try {
      dialog.present();
      await dispatch(acceptInventoryKnowledge({
        inventoryKnowledgeExtraction: results,
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
    return results && Object.keys(results).length;
  };

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
              rows={items}
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
                </header>

                <TableContainer className={classes.dataResults} component={Paper}>
                  <Table stickyHeader size="small" aria-label="results table">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('Table:Header:LocalFile')}</TableCell>
                        <TableCell>{t('Table:Header:Component')}</TableCell>
                        <TableCell>{t('Table:Header:PURL')}</TableCell>
                        <TableCell>{t('Table:Header:Version')}</TableCell>
                        <TableCell>{t('Table:Header:License')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                       {isValid() ? Object.keys(results).map((key) => (
                        results[key].inventories.map( inv => (
                          <TableRow key={key}>
                            <TableCell>{results[key].localFiles.map(function (f) {
                              return f; }).join(", ")}</TableCell>
                            <TableCell>
                              <div className="component-name-cell" title={inv.name}>
                                <IconComponent name={inv.name} size={24} />
                                <h3>{inv.name}</h3>
                              </div>
                            </TableCell>
                            <TableCell>{inv.purl}</TableCell>
                            <TableCell>{inv.version}</TableCell>
                            <TableCell>{inv.licenseName}</TableCell>
                          </TableRow>
                        ))
                      )) : (
                          <TableRow>
                            <TableCell colSpan={5}>
                              <p className="text-center">
                                {t('Title:NoMatchFound')}
                              </p>
                            </TableCell>
                          </TableRow>
                       )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
          </Grid>
        )}

        <hr className="divider" />

        <form onSubmit={onSubmit}>

            { activeStep === 0 && (
              <div className="button-container">
                <Button type="button" variant="contained" color="secondary" onClick={handleNext}>
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
