import React from "react";
import { Autocomplete, AutocompleteProps, Box, Paper, useTheme } from '@mui/material';
import TextField from '@mui/material/TextField';

// icons
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';


interface LicenseSelectorProps extends AutocompleteProps<any, any, any, any> {
  showURL?: boolean;
}

const defaultProps: Partial<LicenseSelectorProps> = {
  showURL: true,
};

const LicenseSelector: React.FC<Partial<LicenseSelectorProps>> = (props) => {
  const {showURL, ...autocompleteProps } = {...defaultProps, ...props};
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
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
              <Box
                sx={{
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
                }}
              >
                <span>{option.name}</span>
                <span className="middle">{option.spdxid}</span>
              </Box>
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
              {...params}
              InputProps={{
                ...params.InputProps,
                startAdornment: <SearchIcon />,
                className: 'autocomplete-option',
              }}
            />
          )}
        />
      </Paper>

      { showURL &&
        <Box
          sx={{
            marginTop: 1.5,
            '& small': {
              fontSize: 10,
              color: '#666666'
            },
          }}
        >
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
        </Box>
      }
    </Box>
  );
};

LicenseSelector.defaultProps = {
  showURL: true,
};

export default LicenseSelector;
