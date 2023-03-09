import React from "react";
import { Autocomplete, AutocompleteProps, Paper } from '@mui/material';
import TextField from '@mui/material/TextField';

// icons
import SearchIcon from '@mui/icons-material/Search';
import { makeStyles } from '@mui/styles';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  option: {
    display: 'flex',
    flexDirection: 'column',
    '& span.middle': {
      fontSize: '0.8rem',
      color: '#6c6c6e',
    },
    '& .searcher': {
      display: 'flex',
      alignItems: 'center',
      fontSize: 14,
      fontWeight: 500,
      color: theme.palette.primary.main,
    },
  },
  attributionInfo: {
    marginTop: 5,
    '& small': {
      fontSize: 10,
      color: '#666666'
    },
  },
}));

interface LicenseSelectorProps extends AutocompleteProps<any, any, any, any> {
  showURL?: boolean;
}

const defaultProps: Partial<LicenseSelectorProps> = {
  showURL: true,
};

const LicenseSelector: React.FC<Partial<LicenseSelectorProps>> = (props) => {
  const {showURL, ...autocompleteProps } = {...defaultProps, ...props};
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Paper>
        <Autocomplete
          size="small"
          fullWidth
          options={[]}
          disableClearable
          getOptionLabel={(option: any) => option.name || option.spdxid || '' }
          isOptionEqualToValue={(option: any, value: any) => option.spdxid === value.spdxid}
          renderOption={(props, option, { selected }) => (
            <li {...props} key={option.spdxid}>
              <div className={classes.option}>
                <span>{option.name}</span>
                <span className="middle">{option.spdxid}</span>
              </div>
            </li>
          )}
          filterOptions={(options, params) => {
            return options.filter(
              (option) =>
                option.name
                  .toLowerCase()
                  .includes(params.inputValue.toLowerCase()) ||
                option.spdxid
                  .toLowerCase()
                  .includes(params.inputValue.toLowerCase())
            );
          }}
          {...autocompleteProps}
          renderInput={(params) => (
            <TextField
              required
              {...params}
              InputProps={{
                ...params.InputProps,
                startAdornment: <SearchIcon />,
                disableUnderline: true,
                className: 'autocomplete-option',
              }}
            />
          )}
        />
      </Paper>

      { showURL &&
        <div className={classes.attributionInfo}>
          <small className="d-flex align-center">
            <span className="mr-1">SPDX Specification: </span>
            {autocompleteProps.value && autocompleteProps.value.spdxid && !autocompleteProps.value.spdxid?.startsWith('LicenseRef') ? (
              <a
                className="color-primary d-flex align-center"
                target="_blank"
                rel="noreferrer"
                href={`https://spdx.org/licenses/${autocompleteProps.value.spdxid}.html`}
                tabIndex={-1}
              >
                <span>https://spdx.org/licenses/{autocompleteProps.value.spdxid}.html&nbsp;</span>
                <OpenInNewOutlinedIcon fontSize="inherit" />
              </a>
            ) : (
              '-'
            )}
          </small>
        </div>
      }
    </div>
  );
};

LicenseSelector.defaultProps = {
  showURL: true,
};

export default LicenseSelector;
