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
  Switch,
  Divider,
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
  const isFilterActive = (currentFilter: IWorkbenchFilter) => currentFilter?.status || currentFilter?.usage;

  const handleChange = (filter, value) => {
    dispatch(setFilter({ [filter]: value !== 'all' ? value : null }));
  };

  const handleReset = (event) => {
    dispatch(setFilter({ status: null, usage: null }));
  };

  const handleClick = (filterValue, value) => {
    if (filter && filter[filterValue] === value) {
      dispatch(setFilter({ [filterValue]: null }));
    }
  };

  const setFileTreeViewMode = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) await projectService.setFileTreeViewMode(FileTreeViewMode.PRUNE);
    else await projectService.setFileTreeViewMode(FileTreeViewMode.DEFAULT);
  };

  const FormControlElement = (props) => {
    const { label } = props;
    return (
      <Tooltip title={label.charAt(0).toUpperCase() + label.slice(1)} disableHoverListener={open} placement="top" arrow>
        <FormControlLabel {...props} control={<Radio size="small" />} />
      </Tooltip>
    );
  };

  return (
    <>
      <Box id="WorkbenchFilters" boxShadow={1} className={`workbench-filters ${open ? 'no-collapsed' : 'collapsed'}`}>
        <header className="workbench-filters-header">
          <h4 className="mr-1 mb-0 mt-0">Filters</h4>
          {isFilterActive(filter) && (
            <Tooltip title="Clean filters">
              <IconButton size="small" aria-label="clean" className="btn-clean" onClick={handleReset}>
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
        </header>
        <Collapse in={open} collapsedHeight={34}>
          <form className="workbench-filters-body">
            <FormControl component="fieldset" className="workbench-filters-group usage">
              <FormLabel component="span">Usage</FormLabel>
              <RadioGroup
                aria-label="usage"
                name="usage"
                value={filter?.usage || 'all'}
                onChange={(event) => handleChange('usage', event.target.value)}
                onClick={(event: any) => event.target.value && handleClick('usage', event.target.value)}
                className="flex-row ml-2"
              >
                <FormControlElement value="all" label="All" className="d-none" />
                <FormControlElement value={FileUsageType.FILE} label={FileUsageType.FILE} />
                <FormControlElement value={FileUsageType.SNIPPET} label={FileUsageType.SNIPPET} />
              </RadioGroup>
            </FormControl>

            <Divider orientation="vertical" flexItem />

            <FormControl component="fieldset" className="workbench-filters-group status">
              <FormLabel component="span">Status</FormLabel>
              <RadioGroup
                aria-label="status"
                name="usage"
                value={filter?.status || 'all'}
                onChange={(event) => handleChange('status', event.target.value)}
                onClick={(event: any) => event.target.value && handleClick('status', event.target.value)}
                className="flex-row ml-2"
              >
                <FormControlElement value="all" label="All" className="d-none" />
                <FormControlElement
                  className={FileStatusType.PENDING}
                  value={FileStatusType.PENDING}
                  label={FileStatusType.PENDING}
                />
                <FormControlElement
                  className={FileStatusType.IDENTIFIED}
                  value={FileStatusType.IDENTIFIED}
                  label={FileStatusType.IDENTIFIED}
                />
                <FormControlElement
                  className={FileStatusType.ORIGINAL}
                  value={FileStatusType.ORIGINAL}
                  label={FileStatusType.ORIGINAL}
                />
                <FormControlElement
                  className={FileStatusType.NOMATCH}
                  value={FileStatusType.NOMATCH}
                  label="No Match"
                />
                <FormControlElement
                  className={FileStatusType.FILTERED}
                  value={FileStatusType.FILTERED}
                  label="Ignored"
                />
              </RadioGroup>
            </FormControl>

            <Divider orientation="vertical" flexItem />

            <FormGroup>
              <Tooltip title="Show only filtered matches" disableHoverListener={open} placement="top" arrow>
                <FormControlLabel
                  className="tree-toggle-switch"
                  control={<Switch onChange={setFileTreeViewMode} size="small" color="primary" />}
                  label={open ? <small>Show only filtered matches</small> : ''}
                />
              </Tooltip>
            </FormGroup>
          </form>
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
