import React, { useEffect, useState } from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Box,
  Collapse,
  IconButton,
  Button,
  Tooltip,
  Switch,
  Divider,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { useDispatch, useSelector } from 'react-redux';
import { projectService } from '@api/services/project.service';
import { FileStatusType, FileTreeViewMode, FileUsageType } from '@api/types';
import { setFilter, resetFilter, selectNavigationState } from '@store/navigation-store/navigationSlice';
import SearchBox from '@components/SearchBox/SearchBox';

const useStyles = makeStyles((theme) => ({
  info: {
    maxWidth: 100,
    textAlign: 'center',
    lineHeight: 'normal',
  },
}));

const WorkbenchFilters = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { filter, isFilterActive } = useSelector(selectNavigationState);

  const [open, setOpen] = useState<boolean>(false);
  const [fileTreeViewMode, setFileTreeViewMode] = useState<boolean>(false);

  const handleChange = (filter, value) => {
    dispatch(setFilter({ filter: { [filter]: value !== 'all' ? value : null } }));
  };

  const handleFilenameChange = (term: string) => {
    dispatch(setFilter({ filter: { filename: term || null } }));
  };

  const handleReset = (event) => {
    dispatch(resetFilter());
    setFileTreeViewMode(false);
  };

  const handleClick = (filterValue, value) => {
    if (filter && filter[filterValue] === value) {
      dispatch(setFilter({ filter: { [filterValue]: null } }));
    }
  };

  useEffect(() => {
    projectService.setFileTreeViewMode(fileTreeViewMode ? FileTreeViewMode.PRUNE : FileTreeViewMode.DEFAULT);
  }, [fileTreeViewMode]);

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
      <Box id="WorkbenchFilters" boxShadow={0} className={`workbench-filters ${open ? 'no-collapsed' : 'collapsed'}`}>
        <header className="workbench-filters-header">
          <h4 className="mr-1 mb-2 mt-0 d-flex align-end">
            Filters
            <Tooltip
              classes={{ tooltip: classes.info }}
              title={
                <>
                  <p className="mt-1 mb-1">Use filters to modify displayed results.</p>
                  <p>
                    <small>
                      USAGE <br />
                      Filter by file match type: File or Snippet.
                    </small>
                  </p>
                  <p>
                    <small>
                      STATUS <br />
                      Filter by the status of each file.
                    </small>
                  </p>
                  <p>
                    <small>
                      PATH <br />
                      Filter by the path of each file.
                    </small>
                  </p>
                </>
              }
              placement="bottom"
              arrow
            >
              <small>
                <InfoOutlinedIcon className="ml-1" fontSize="inherit" />
              </small>
            </Tooltip>
          </h4>
          {isFilterActive && (
            <Tooltip title="Clear filters">
              <IconButton size="small" aria-label="clear" className="btn-clean" onClick={handleReset}>
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
        </header>
        <Collapse in={open} collapsedSize={30}>
          <form className="workbench-filters-body">
            <FormControl
              component="fieldset"
              className={`workbench-filters-group usage ${filter?.usage ? 'active' : ''}`}
            >
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

            <FormControl
              component="fieldset"
              className={`workbench-filters-group usage ${filter?.status ? 'active' : ''}`}
            >
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
              <Tooltip
                classes={{ tooltip: classes.info }}
                placement={open ? 'right' : 'bottom'}
                title={
                  <>
                    <p className="mt-1 mb-1">Show only filtered matches in filetree</p>
                  </>
                }
                disableHoverListener={open}
                arrow
              >
                <FormControlLabel
                  disabled={!isFilterActive}
                  className="tree-toggle-switch"
                  control={
                    <Switch
                      onChange={(e) => setFileTreeViewMode(e.target.checked)}
                      checked={fileTreeViewMode}
                      size="small"
                      color="primary"
                    />
                  }
                  label={open ? <small>Show only filtered matches in filetree</small> : ''}
                />
              </Tooltip>
            </FormGroup>
          </form>
        </Collapse>

        <Button onClick={() => setOpen(!open)}>
          {open ? (
            <KeyboardArrowUpOutlinedIcon fontSize="inherit" />
          ) : (
            <KeyboardArrowDownOutlinedIcon fontSize="inherit" />
          )}
        </Button>

        <SearchBox
          value={filter?.filename || ''}
          placeholder="Filter by path (e.g. *.js)"
          onChange={(e) => handleFilenameChange(e)}
        />
      </Box>
    </>
  );
};

export default WorkbenchFilters;
