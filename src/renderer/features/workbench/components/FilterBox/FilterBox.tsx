import React, { useContext, useEffect, useState } from 'react';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormGroup, Checkbox } from '@material-ui/core';
import { FileStatusType, FileTreeViewMode, FileUsageType } from '../../../../../api/types';
import { WorkbenchContext } from '../../store';
import { setFilter } from '../../actions';
import { projectService } from '../../../../../api/project-service';

const FilterBox = () => {
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
    <div id="FilterBox" className="filter-box-container">
      <form className="ml-2 mt-2 mb-1">
        <FormControl component="fieldset">
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
        <FormControl component="fieldset">
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
              value={FileStatusType.ORIGINAL}
              control={<Radio size="small" />}
              label={FileStatusType.ORIGINAL}
            />
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
          </RadioGroup>
        </FormControl>
        <FormLabel component="legend">File Tree View Mode</FormLabel>
        <FormGroup>
          <FormControlLabel control={<Checkbox onChange={setFileTreeViewMode} />} label="File Tree View" />
        </FormGroup>
      </form>
    </div>
  );
};

export default FilterBox;
