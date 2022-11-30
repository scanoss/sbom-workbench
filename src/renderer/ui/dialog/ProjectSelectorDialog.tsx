import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent, Grid,
  IconButton,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import Alert from '@mui/material/Alert';
import { useSelector } from 'react-redux';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from 'react-i18next';
import { selectWorkspaceState } from '@store/workspace-store/workspaceSlice';
import { DataGrid } from '@mui/x-data-grid';
import { InventoryKnowledgeExtraction, IProject } from '@api/types';
import { projectService } from '@api/services/project.service';


const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '900px',
    },
  },
  selector: {
    width: '100%',
    justifyContent: 'space-between',
    '& .form-group': {
      width: 400,
    }
  },
  left: {
    height: 400,
    background: 'white',
  },
  dataGrid: {}
}));

interface IProjectSelectorDialog {
  open: boolean;
  params: { folder?: string, md5File?: string };
  onClose: (response: any) => void;
  onCancel: () => void;
}

export const ProjectSelectorDialog = (props: IProjectSelectorDialog) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { open,  params, onClose, onCancel } = props;

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

  const onPreviewHandler = async () => {
    const set = new Set(selected);
    const projectsSelected = items.filter((r) => set.has(r.uuid));

    const response = await projectService.extractInventoryKnowledge({
      override: true,
      folder: params?.folder,
      md5File: params?.md5File,
      source: [...projectsSelected],
      target: {...currentProject},
    });

    setResults(response);
  }

  const onSubmit = (e) => {
    e.preventDefault();
  };

  const onSelectionHandler = (data, details) => {
    setSelected(data);
  };

  const isValid = () => {
    // return checked.length > 0;
    return true;
  };

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
          <Alert className="mt-1 mb-1" severity="info">
            {t('ActionCurrentFilterCriteria')}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={4}>
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
                rowHeight={23}
                disableColumnMenu
                rowsPerPageOptions={[100]}
                hideFooter
                checkboxSelection
                headerHeight={41}
                onSelectionModelChange={onSelectionHandler}
              />
            </div>

            <Button variant="contained" color="secondary" onClick={onPreviewHandler} >
              {t('Button:Preview')}
            </Button>
          </Grid>
          <Grid item xs={8}>
              <div className="list-container">
                <TableContainer className="results-table selectable" component={Paper}>
                  <Table stickyHeader aria-label="results table">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('Table:Header:Local File')}</TableCell>
                        <TableCell>{t('Table:Header:MD5')}</TableCell>
                        <TableCell>{t('Table:Header:Component')}</TableCell>
                        <TableCell>{t('Table:Header:Purl')}</TableCell>
                        <TableCell>{t('Table:Header:Version')}</TableCell>
                        <TableCell>{t('Table:Header:License')}</TableCell>
                        <TableCell width={70} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                       {results && Object.keys(results).map((key) => (
                        results[key].inventories.map( inv => (
                          <TableRow key={key}>
                            <TableCell>{results[key].localFiles.map(function (f) {
                              return f; }).join(", ")}</TableCell>
                            <TableCell>{key}</TableCell>
                            <TableCell>{inv.name}</TableCell>
                            <TableCell>{inv.purl}</TableCell>
                            <TableCell>{inv.version}</TableCell>
                            <TableCell>{inv.licenseName}</TableCell>
                          </TableRow>
                        ))
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
          </Grid>
        </Grid>

        <hr className="divider" />

        <form onSubmit={onSubmit}>
          <div className="button-container">
            <Button color="inherit" tabIndex={-1} onClick={onCancel}>{t('Button:Cancel')}</Button>
            <Button type="submit" variant="contained" color="secondary" disabled={!isValid()}>
              {t('Button:Import')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSelectorDialog;
