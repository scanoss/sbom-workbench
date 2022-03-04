import React, { useContext, useState } from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
  Box,
  Collapse,
  IconButton,
  Button,
  Tooltip,
} from '@material-ui/core';
import KeyboardArrowDownOutlinedIcon from '@material-ui/icons/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@material-ui/icons/KeyboardArrowUpOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import { FileStatusType, FileTreeViewMode, FileUsageType, IWorkbenchFilter } from '../../../../../api/types';
import { WorkbenchContext } from '../../store';
import { setFilter } from '../../actions';
import { projectService } from '../../../../../api/project-service';

const WorkbenchFilters = () => {
  const { dispatch, state } = useContext(WorkbenchContext);
  const { filter } = state;

  const [open, setOpen] = useState<boolean>(false);

  const handleChange = (filter, value) => {
    dispatch(setFilter({ [filter]: value !== 'all' ? value : null }));
  };

  const handleReset = (event) => {
    dispatch(setFilter({ status: null, usage: null }));
  };

  const isFilterActive = (currentFilter: IWorkbenchFilter) => currentFilter?.status || currentFilter?.usage;

  const setFileTreeViewMode = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) await projectService.setFileTreeViewMode(FileTreeViewMode.PRUNE);
    else await projectService.setFileTreeViewMode(FileTreeViewMode.DEFAULT);
  };
  return (
    <>
      <Box boxShadow={1} id="WorkbenchFilters" className="workbench-filters">
        <header className="d-flex">
          <h4 className="ml-2 mb-0 mt-0">Filters</h4>
          {isFilterActive(filter) &&
            <Tooltip title="Clean filters">
              <IconButton size="small" aria-label="clean" className="btn-clean" onClick={handleReset}>
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          }
        </header>
        <Collapse in={open}>
          <section className="workbench-filters-status ml-3 mt-1">
            <form>
              <FormControl component="fieldset" className="workbench-filters-group usage mb-4">
                <FormLabel component="legend">Usage</FormLabel>
                <RadioGroup
                  aria-label="usage"
                  name="usage"
                  value={filter?.usage || 'all'}
                  onChange={(event) => handleChange('usage', event.target.value)}
                  className="flex-row ml-2"
                >
                  <FormControlLabel value="all" control={<Radio size="small" />} label="All" />
                  <FormControlLabel
                    value={FileUsageType.FILE}
                    control={<Radio size="small" />}
                    label={FileUsageType.FILE}
                  />
                  <FormControlLabel
                    value={FileUsageType.SNIPPET}
                    control={<Radio size="small" />}
                    label={FileUsageType.SNIPPET}
                  />
                </RadioGroup>
              </FormControl>
              <FormControl component="fieldset" className="workbench-filters-group status mb-1">
                <FormLabel component="legend">Match Status</FormLabel>
                <RadioGroup
                  aria-label="status"
                  name="usage"
                  value={filter?.status || 'all'}
                  onChange={(event) => handleChange('status', event.target.value)}
                  className="flex-row ml-2"
                >
                  <FormControlLabel value="all" control={<Radio size="small" />} label="All" />
                  <FormControlLabel
                    value={FileStatusType.PENDING}
                    control={<Radio size="small" />}
                    label={FileStatusType.PENDING}
                  />
                  <FormControlLabel
                    value={FileStatusType.IDENTIFIED}
                    control={<Radio size="small" />}
                    label={FileStatusType.IDENTIFIED}
                  />
                  <FormControlLabel
                    value={FileStatusType.ORIGINAL}
                    control={<Radio size="small" />}
                    label={FileStatusType.ORIGINAL}
                  />
                  <FormControlLabel value={FileStatusType.NOMATCH} control={<Radio size="small" />} label="No Match" />
                  <FormControlLabel
                    value={FileStatusType.FILTERED}
                    control={<Radio size="small" />}
                    label={FileStatusType.FILTERED}
                  />
                </RadioGroup>
              </FormControl>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox onChange={setFileTreeViewMode} />}
                  label={<small>Show only filter matches</small>}
                />
              </FormGroup>
            </form>
          </section>
        </Collapse>

        <Button size="small" onClick={() => setOpen(!open)}>
          {open ? (
            <KeyboardArrowUpOutlinedIcon fontSize="inherit" />
          ) : (
            <KeyboardArrowDownOutlinedIcon fontSize="inherit" />
          )}
        </Button>
      </Box>
    </>
  );
};

export default WorkbenchFilters;
