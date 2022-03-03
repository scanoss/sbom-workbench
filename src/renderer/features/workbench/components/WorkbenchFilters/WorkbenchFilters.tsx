import React, { useContext, useEffect, useState } from 'react';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormGroup, Checkbox, Box } from '@material-ui/core';
import { FileStatusType, FileTreeViewMode, FileUsageType } from '../../../../../api/types';
import { WorkbenchContext } from '../../store';
import { setFilter } from '../../actions';
import { projectService } from '../../../../../api/project-service';

const WorkbenchFilters = () => {
  const { dispatch, state } = useContext(WorkbenchContext);
  const { filter } = state;

  const handleChange = (filter, value) => {
    dispatch(setFilter({ [filter]: value !== 'all' ? value : null }));
  };

  const setFileTreeViewMode = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) await projectService.setFileTreeViewMode(FileTreeViewMode.PRUNE);
    else await projectService.setFileTreeViewMode(FileTreeViewMode.DEFAULT);
  };
  return (
    <Box boxShadow={1} id="WorkbenchFilters" className="workbench-filters">
      <section className="workbench-filters-status ml-3">
        <h4>Filters</h4>
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
              <FormControlLabel value={FileUsageType.FILE} control={<Radio size="small" />} label={FileUsageType.FILE} />
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
              <FormControlLabel
                value={FileStatusType.NOMATCH}
                control={<Radio size="small" />}
                label="No Match"
              />
              <FormControlLabel
                value={FileStatusType.FILTERED}
                control={<Radio size="small" />}
                label={FileStatusType.FILTERED}
              />
            </RadioGroup>
          </FormControl>
          <FormGroup>
            <FormControlLabel control={<Checkbox onChange={setFileTreeViewMode} />} label={<small>Show only filter matches</small>} />
          </FormGroup>
        </form>
      </section>
    </Box>
  );
};

export default WorkbenchFilters;
