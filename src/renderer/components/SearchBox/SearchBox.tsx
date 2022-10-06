import React, { useEffect, useState } from 'react';
import { Paper, IconButton, InputBase } from '@mui/material';
import { makeStyles } from '@mui/styles';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { AppI18n } from '@shared/i18n';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '0px 4px',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  iconButton: {
    opacity: 0.6,
    padding: 10,
  },
}));

export interface SearchBoxProps {
  value?: string;
  placeholder?: string;
  responseDelay?: number;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const SearchBox = ({ value, placeholder, responseDelay, disabled, onChange }: SearchBoxProps) => {
  const classes = useStyles();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const timeOutId = setTimeout(() => onChange(query), responseDelay);
    return () => clearTimeout(timeOutId);
  }, [query]);

  useEffect(() => {
    if (value !== query) setQuery(value);
  }, [value]);

  return (
    <Paper id="SearchBox" component="form" className={classes.root}>
      <SearchIcon className={`start-icon ${classes.iconButton}`} />
      <InputBase
        disabled={disabled}
        className={classes.input}
        value={query}
        onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
        onChange={(e: any) => setQuery(e.target.value)}
        placeholder={placeholder || 'Search...'}
        inputProps={{ 'aria-label': placeholder, spellCheck: 'false' }}
      />
      {query && (
        <IconButton size="small" className={`end-icon ${classes.iconButton}`} onClick={() => setQuery('')}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      )}
    </Paper>
  );
};

SearchBox.defaultProps = { value: '', placeholder: null, responseDelay: 300, disabled: false };

export default SearchBox;
