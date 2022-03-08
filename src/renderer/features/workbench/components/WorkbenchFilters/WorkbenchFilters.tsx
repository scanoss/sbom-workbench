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
      <Box id="WorkbenchFilters" boxShadow={1} className={`workbench-filters ${open ? 'no-collapsed' : 'collapsed'}`}>
        <header className="workbench-filters-header">
          <h4 className="mr-1 mb-0 mt-0">Filters</h4>
          {isFilterActive(filter) &&
            <Tooltip title="Clean filters">
              <IconButton size="small" aria-label="clean" className="btn-clean" onClick={handleReset}>
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          }
        </header>
        <Collapse in={open} collapsedHeight={25}>
          <form className="workbench-filters-body">
            <FormControl component="fieldset" className="workbench-filters-group usage">
              <FormLabel component="span">Usage</FormLabel>
              <RadioGroup
                aria-label="usage"
                name="usage"
                value={filter?.usage || 'all'}
                onChange={(event) => handleChange('usage', event.target.value)}
                className="flex-row ml-2"
              >
                <FormControlLabel value="all" control={<Radio size="small" />} label="All" />
                <Tooltip title={FileUsageType.FILE} disableHoverListener={open} placement="top" arrow>
                  <FormControlLabel
                    value={FileUsageType.FILE}
                    control={<Radio size="small" />}
                    label={FileUsageType.FILE}
                  />
                </Tooltip>
                <Tooltip title={FileUsageType.SNIPPET} disableHoverListener={open} placement="top" arrow>
                  <FormControlLabel
                    value={FileUsageType.SNIPPET}
                    control={<Radio size="small" />}
                    label={FileUsageType.SNIPPET}
                  />
                </Tooltip>
              </RadioGroup>
            </FormControl>
            <FormControl component="fieldset" className="workbench-filters-group status">
              <FormLabel component="span">Status</FormLabel>
              <RadioGroup
                aria-label="status"
                name="usage"
                value={filter?.status || 'all'}
                onChange={(event) => handleChange('status', event.target.value)}
                className="flex-row ml-2"
              >
                <FormControlLabel value="all" control={<Radio size="small" />} label="All" />
                <FormControlLabel
                  className={FileStatusType.PENDING}
                  value={FileStatusType.PENDING}
                  control={<Radio size="small" />}
                  label={FileStatusType.PENDING}
                />
                <FormControlLabel
                  className={FileStatusType.IDENTIFIED}
                  value={FileStatusType.IDENTIFIED}
                  control={<Radio size="small" />}
                  label={FileStatusType.IDENTIFIED}
                />
                <FormControlLabel
                  className={FileStatusType.ORIGINAL}
                  value={FileStatusType.ORIGINAL}
                  control={<Radio size="small" />}
                  label={FileStatusType.ORIGINAL}
                />
                <FormControlLabel
                  className={FileStatusType.NOMATCH}
                  value={FileStatusType.NOMATCH}
                  control={<Radio size="small" />}
                  label="No Match"
                />
                <FormControlLabel
                  className={FileStatusType.FILTERED}
                  value={FileStatusType.FILTERED}
                  control={<Radio size="small" />}
                  label={FileStatusType.FILTERED}
                />
              </RadioGroup>
            </FormControl>
          </form>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox onChange={setFileTreeViewMode} />}
              label={<small>Show only filter matches</small>}
            />
          </FormGroup>
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
