import React, { useEffect, useState } from 'react';
import { Paper, IconButton, InputBase, makeStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
}));

export interface SearchBoxProps {
  placeholder: string;
  responseDelay: number;
  onChange: (value: string) => void;
}

const SearchBox = ({ placeholder, responseDelay, onChange }: SearchBoxProps) => {
  const classes = useStyles();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timeOutId = setTimeout(() => onChange(query), responseDelay);
    return () => clearTimeout(timeOutId);
  }, [query]);

  return (
    <Paper component="form" className={classes.root}>
      <IconButton className={classes.iconButton} aria-label="menu">
        <SearchIcon />
      </IconButton>
      <InputBase
        className={classes.input}
        onKeyUp={(e: any) => setQuery(e.target.value)}
        placeholder={placeholder}
        inputProps={{ 'aria-label': placeholder, spellCheck: 'false' }}
      />
    </Paper>
  );
};

SearchBox.defaultProps = { placeholder: 'Search...', responseDelay: 300 };

export default SearchBox;
