import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { workspaceService } from '@api/services/workspace.service';
import { GroupSearchKeywordDTO } from '@api/dto';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { Autocomplete, Chip, TextField } from '@mui/material';
import * as SearchUtils from '@shared/utils/search-utils';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    button: {
      position: 'absolute',
      top: 9,
      right: 9,
      zIndex: 1,
    },
    autocomplete: {
      '& .MuiAutocomplete-endAdornment': {},
    },
    searchInput: {
      '& .MuiInputBase-input': {
        fontSize: '0.8rem',
        padding: '7px 0px !important',
      },
    },
    dataGrid: {
      '& .MuiDataGrid-columnHeader': {
        fontSize: '12px',
        fontWeight: '400 !important',
        padding: 0,
        '& .MuiDataGrid-columnSeparator': {
          display: 'none',
        },
      },
      '& .MuiDataGrid-columnHeaderCheckbox': {
        '& .MuiSvgIcon-root': {
          width: '0.85em',
          height: '0.85em',
        },
      },
      '& .MuiTablePagination-caption': {
        fontSize: '0.8rem',
        fontWeight: 500,
      },
      '& .MuiTablePagination-actions': {
        marginLeft: 10,
      },
      border: 2,
      '& .MuiDataGrid-cell': {
        border: 0,
        padding: '0 3px',
      },
      '& .MuiDataGrid-cell.MuiDataGrid-cellCheckbox': {
        visibility: 'hidden',
  
        '& .MuiSvgIcon-root': {
          width: '0.85em',
          height: '0.85em',
        },
      },
      '& .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell.MuiDataGrid-cellCheckbox': {
        visibility: 'visible !important',
      },
      '& .MuiDataGrid-row:hover': {
        '& .MuiDataGrid-cell.MuiDataGrid-cellCheckbox': {
          visibility: 'visible',
        },
      },
      '& .MuiButtonBase-root ': {
        padding: 0,
      },
    },
}));

export const KeywordGroupDialog = ({ onGroupCreated, groupEdit , groupMapper, isEditMode, onCancel, isOpen }) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const searchQuery = useRef(null);
    const [value, setValue] = React.useState<string[]>([]);
    const [form, setForm] = useState<
    Partial<{
      id?: number;
      label: string;
      words: Array<string>;
    }>>({ words: [] });

    const resetFields = ()=>{
      searchQuery.current = [];
      setForm({words:[], label:'' });
      setValue([]);
    };

    const cancel = () => {
      resetFields();
      onCancel()
    }

    const createGroup = async () => {
        let groups = null;
        if(form && form.id){
          groups = await workspaceService.updateSearchGroup(form as GroupSearchKeywordDTO); 
        } else {
          groups = await workspaceService.addSearchGroups([form] as Array<GroupSearchKeywordDTO>); 
        }    
        return onGroupCreated();
    }

    const inputHandler = (name, value) => {
        setForm({
        ...form,
        [name]: value,
        });
    };

    const getTags = (tags: string[]) =>{
        const nTags = tags
        .map((tag) => tag.toLowerCase().trim())
        .map((tag) => SearchUtils.getTerms(tag))
        .flat();
        return nTags;
      }

    const onTagsHandler = (tags: string[]) => {
        const nTags = getTags(tags);
        searchQuery.current = nTags.join(' ');
        setValue(nTags);
        inputHandler('words', tags.length > 0 ? tags : [] );
      };

    const enableSubmit = (form)=>{
    return (form.label === '' || form.words.length <= 0);
    };

    useEffect(() => {
    } ,[]);

    useEffect(() => {
      if(groupEdit){
        const tags = getTags(groupEdit.words);
        searchQuery.current = tags.join(' ');
    
        setForm((prevForm) => ({
          ...prevForm,
          id: groupEdit.id,
          words: groupEdit.words,
          label: groupEdit.label // or any other value you want to set for the label
        }));
        setValue(tags);
    }
    }, [groupEdit]);


    return (
    <>            
      <div className='new-group-dialog'>
          <section className='form-box'>
            <article>
              <div className="dialog-form-field">
                <label className="dialog-form-field-label">Group</label><span className='group-exists' hidden={isEditMode || !groupMapper.has(form.label)} > group already exists!</span>
                  <Paper className="dialog-form-field-control">
                    <TextField                                      
                      name="label"
                      size="small"
                      fullWidth
                      disabled={isEditMode}
                      autoFocus
                      value={form?.label}
                      InputProps= {{                          
                        disableUnderline: true,
                      }}
                      onChange={(e) => inputHandler(e.target.name, e.target.value)}
                      required
                    />
                  </Paper>
              </div>
            </article>

            <article>                          
                <Autocomplete
                  multiple
                  className={classes.autocomplete}
                  fullWidth
                  size="small"
                  options={['license', 'copyright', 'author', 'version']}
                  freeSolo
                  value={value}
                  renderTags={(value: readonly string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                      // eslint-disable-next-line react/jsx-key
                      <Chip
                        color="primary"
                        variant="outlined"
                        size="small"
                        label={option}
                        {...getTagProps({ index })}
                        className="bg-primary mr-1"
                      />
                    ))
                  }
                  onChange={(event, data) => onTagsHandler(data)}
                  renderInput={(params) => (
                    <>
                    <div className="dialog-form-field">
                        <label className="dialog-form-field-label">Words</label>
                        <Paper className="dialog-form-field-control">
                          <TextField
                            {...params}
                            name="name"
                            size="small"
                            fullWidth
                            className={classes.searchInput}                                            
                            InputProps={{
                              ...params.InputProps,                                              
                              disableUnderline: true,
                            }}
                          />
                        </Paper>
                      </div>
                    </>
                  )}
                />                            
            </article>
          </section>
          <section className='new-group-btn-box'>
            <Button tabIndex={-1} onClick={cancel} color="inherit">
              {t('Button:Cancel')}
            </Button>
            <Button
              className="mr-1 p-2 text-uppercase"
              size="small"
              variant="contained"
              color="secondary"
              disabled={enableSubmit(form)}
              style={{ padding: 0, lineHeight: 1, minWidth: 0 }}    
              onClick={(event) => {
                event.stopPropagation(); 
                createGroup();                                               
              }}                     
            >Create
            </Button>
          </section>       
      </div>
    </>
    );
}