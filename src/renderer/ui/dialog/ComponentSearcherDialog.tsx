import { Dialog, Paper, DialogActions, Button, makeStyles, InputBase, CircularProgress } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { DialogResponse, DIALOG_ACTIONS } from '@context/types';
import { componentService } from '@api/services/component.service';
import { DataGrid } from '@material-ui/data-grid';
import useApi from '@hooks/useApi';
import { licenseService } from '@api/services/license.service';
import { NewLicenseDTO } from '@api/dto';
import { NewComponentDTO } from '@api/types';
import { IComponentResult } from '../../../main/task/componentCatalog/iComponentCatalog/IComponentResult';

const useStyles = makeStyles((theme) => ({
  size: {
    '& .MuiDialog-paperWidthMd': {
      width: '500px',
    },
  },
  search: {
    padding: '10px 0px 10px 10px',
  },
  dataGrid: {
    height: 400,
    '& .MuiDataGrid-cell': {
      fontSize: 12,
    },
    '& .MuiDataGrid-cell:focus-within': {
      outline: 'none !important',
    },
  },
}));

interface ComponentSearcherDialogProps {
  open: boolean;
  query: string;
  onClose: (response: DialogResponse) => void;
  onCancel: () => void;
}

const ComponentSearcherDialog = (props: ComponentSearcherDialogProps) => {
  const classes = useStyles();
  const { open, query, onClose, onCancel } = props;
  const { data, error, loading, execute } = useApi<IComponentResult[]>();

  const [results, setResults] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<any[]>([]);
  const [queryTerm, setQueryTerm] = useState<string>('');

  const licenses = async () => {
    const catalogLicenses = await licenseService.getAll();
    const lic = catalogLicenses.reduce(function (acc, curr) {
      if (!acc[curr.spdxid]) acc[curr.spdxid] = curr;
      return acc;
    }, {});
    return lic;
  };

  const getNoCataloguedLicenses = async (lic, componentVersions) => {
    const nonCataloguedLicenses = {};
    componentVersions.forEach((v) => {
      v.licenses.forEach((l) => {
        if (!lic[l.spdxId]) {
          if (!nonCataloguedLicenses[l.spdxId])
            nonCataloguedLicenses[l.spdxId] = {
              name: l.name,
              fulltext: '-',
              url: l.url,
              spdxid: l.spdxId,
            };
        }
      });
    });
    return Object.values(nonCataloguedLicenses) as Array<NewLicenseDTO>;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    execute(() => componentService.getGlobalComponents({ search: queryTerm, limit: 100 }));
  };

  const onSelectionHandler = (data) => {
    setSelected(data);
  };

  const handleClose = async (e) => {
    e.preventDefault();
    try {
      console.log('handleClose');
      // Takes the selected component
      const componentSelected = results.find((el) => el.id === selected[0]);
      const component = await componentService.getGlobalComponentVersion({ purl: componentSelected.purl });
      // Creates those licenses what not exists in the local catalogue
      const lic = await licenses();
      const nonCataloguedLicenses: any = await getNoCataloguedLicenses(lic, component.versions);
      for (let i = 0; i < nonCataloguedLicenses.length; i += 1) {
        await licenseService.create(nonCataloguedLicenses[i]);

      }
      console.log(component);
      const newComponent: NewComponentDTO = {
        name: component.component,
        versions: [],
        purl: component.purl,
        url: component.url,
      };
      component.versions.forEach((v) => {
        v.licenses.forEach((l) => {
          newComponent.versions.push({ version: v.version, licenseId: lic[l.spdxId].id });
        });
      });
      console.log(newComponent);
      await componentService.create(newComponent);
    } catch (error: any) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    setResults(data ? data.map((value, index) => ({ ...value, id: index })) : []);
  }, [data]);

  return (
    <Dialog
      id="ComponentSearcherDialog"
      className={`${classes.size} dialog`}
      maxWidth="md"
      scroll="body"
      fullWidth
      open={open}
      onClose={onCancel}
    >
      <span className="dialog-title">Search components online</span>

      <form onSubmit={handleSearch}>
        <div className="dialog-content">
          <div className="dialog-row">
            <div className="dialog-form-field d-flex space-between">
              <Paper className="dialog-form-field-control w-100 mr-4">
                <InputBase
                  disabled={loading}
                  name="search"
                  fullWidth
                  value={queryTerm}
                  placeholder="Search"
                  onChange={(e) => setQueryTerm(e.target.value)}
                />
                {loading && <CircularProgress size={18} className="mr-2" />}
              </Paper>

              <Button disabled={loading} type="submit" variant="outlined" color="primary">
                Search
              </Button>
            </div>
          </div>
        </div>
      </form>

      <form onSubmit={handleClose}>
        <DataGrid
          className={classes.dataGrid}
          rows={results}
          columns={[
            { field: 'component', width: 120 },
            { field: 'purl', flex: 1 },
            { field: 'url', flex: 1 },
          ]}
          localeText={{ noRowsLabel: 'No results found' }}
          rowHeight={22}
          disableColumnMenu
          disableColumnSelector
          onSelectionModelChange={onSelectionHandler}
          hideFooter
        />
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button disabled={selected.length === 0} type="submit" variant="contained" color="secondary">
            Select
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ComponentSearcherDialog;
