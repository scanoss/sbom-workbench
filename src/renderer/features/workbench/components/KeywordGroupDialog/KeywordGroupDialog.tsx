import React, { useEffect, useRef, useState } from 'react';
import { workspaceService } from '@api/services/workspace.service';
import { GroupSearchKeywordDTO } from '@api/dto';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { Autocomplete, Chip, TextField } from '@mui/material';
import * as SearchUtils from '@shared/utils/search-utils';
import { useTranslation } from 'react-i18next';

export const KeywordGroupDialog = ({ onGroupCreated, groupEdit , groupMapper, isEditMode, onCancel, isOpen }) => {
    const { t } = useTranslation();
    const searchQuery = useRef(null);
    const [value, setValue] = React.useState<string[]>([]);
    const [form, setForm] = useState<
    Partial<{
      id?: number;
      label: string;
      words: Array<string>;
    }>>({ words: [] });
    const [inputValue, setInputValue] = React.useState("");

    const resetFields = ()=>{
      searchQuery.current = null;
      setForm({words:[], label:'' });
      setValue([]);
      isEditMode = false;
      groupEdit = null;
      setInputValue("");
    };

    const cancel = () => {
      resetFields();
      onCancel()
    }

    const createGroup = async () => {
        // Update group if id is present
        if(form && form.id) {
           await workspaceService.updateSearchGroup(form as GroupSearchKeywordDTO);
        } else {
           await workspaceService.addSearchGroups([form] as Array<GroupSearchKeywordDTO>);
        }
        resetFields();
        onGroupCreated();
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
        inputHandler('words', tags.length > 0 ? nTags : [] );
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
          label: groupEdit.label
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
                <label className="dialog-form-field-label">{t('Dialog:GroupNameLabel')}</label><span className='group-exists' hidden={isEditMode || !groupMapper.has(form.label)}>{t('Dialog:GroupAlreadyExists')}</span>
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
                  sx={{
                    '& .MuiAutocomplete-endAdornment': {},
                  }}
                  fullWidth
                  size="small"
                  options={['license', 'copyright', 'author', 'version']}
                  freeSolo
                  onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                  }}
                  inputValue={inputValue}
                  value = {value}
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
                        <label className="dialog-form-field-label">{t('Dialog:GroupKeywordLabel')}</label>
                        <Paper className="dialog-form-field-control">
                          <TextField
                            {...params}
                            name="name"
                            size="small"
                            fullWidth
                            sx={{
                              '& .MuiInputBase-input': {
                                fontSize: '0.8rem',
                                padding: '7px 0px !important',
                              },
                            }}
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
            >
              {t('Button:Create')}
            </Button>
          </section>
      </div>
    </>
    );
}
