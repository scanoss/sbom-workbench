import React, { useEffect, useState } from 'react';
import { Paper, IconButton, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';


export interface SearchBoxProps {
  value?: string;
  placeholder?: string;
  responseDelay?: number;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const SearchBox = ({ value, placeholder, responseDelay, disabled, onChange }: SearchBoxProps) => {
  const { t } = useTranslation();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const timeOutId = setTimeout(() => onChange(query), responseDelay);
    return () => clearTimeout(timeOutId);
  }, [query]);

  useEffect(() => {
    if (value !== query) setQuery(value);
  }, [value]);

  return (
    <Paper id="SearchBox" component="form"
           sx={{
             padding: '0px 4px',
             display: 'flex',
             alignItems: 'center',
           }}
    >
      <SearchIcon
        className="start-icon"
        sx={{
          opacity: 0.6,
          padding: 1,
        }}
      />
      <InputBase
        disabled={disabled}
        sx={{
          flex: 1,
        }}
        value={query}
        onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
        onChange={(e: any) => setQuery(e.target.value)}
        placeholder={placeholder || t('Search')}
        inputProps={{ 'aria-label': placeholder, spellCheck: 'false' }}
      />
      {query && (
        <IconButton
          size="small"
          className="end-icon"
          sx={{
            opacity: 0.6,
            padding: '10px',
          }}
          onClick={() => setQuery('')}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      )}
    </Paper>
  );
};

SearchBox.defaultProps = { value: '', placeholder: null, responseDelay: 300, disabled: false };

export default SearchBox;
