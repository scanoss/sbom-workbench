import React, { useState } from 'react';
import {
  SelectChangeEvent, FormControl, InputLabel, Select, Input, Checkbox, ListItemText, MenuItem, Button,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const ITEM_HEIGHT = 22;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 200,
    },
  },
};

const names = [

];

const FilterSelector = ({ items }) => {
  const { t } = useTranslation();

  const [personName, setPersonName] = React.useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;

    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <div>
      <Button
        className={`filter btn-version ${true ? 'selected' : ''}`}
        aria-controls="menu"
        aria-haspopup="true"
        endIcon={<ArrowDropDownIcon />}

      >
        test
      </Button>
      <FormControl sx={{ m: 1, width: 200 }} placeholder='Filter by scope'>
        <Select
          multiple
          size="small"
          displayEmpty
          value={personName}
          onChange={handleChange}
          input={<Input disableUnderline />}
          renderValue={(selected) => {
            if (selected.length === 0) {
              return <em>Filter by scope</em>;
            }

            return selected.join(', ');
          }}
          MenuProps={MenuProps}
        >
          {names.map((name) => (
            <MenuItem key={name} value={name} dense>
              <Checkbox checked={personName.indexOf(name) > -1} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default FilterSelector;
