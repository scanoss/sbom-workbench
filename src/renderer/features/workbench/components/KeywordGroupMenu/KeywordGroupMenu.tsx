import React, { useContext, useEffect, useRef, useState } from 'react';
import { exportService } from '@api/services/export.service';
import { ExportSource, ExportFormat, InventoryType, GroupSearchKeyword } from '@api/types';
import AppConfig from '@config/AppConfigModule';
import { getFormatFilesAttributes } from '@shared/utils/file-utils';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dialogController } from 'renderer/controllers/dialog-controller';
import { Button, Collapse, Fade, IconButton, List, Menu, MenuItem, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TocOutlinedIcon from '@mui/icons-material/TocOutlined';

import GetAppIcon from '@mui/icons-material/GetApp';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { workspaceService } from '@api/services/workspace.service';

export const KeywordGroupMenu = ({ onValueChange }) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const [keywordGroups, setKeywordGroups] = useState<Array<GroupSearchKeyword>>([]);

  const openMenu = () => {
      setIsOpen(true);
  };

  const closeMenu = () => {
      setIsOpen(false);
  };

  const deleteGroup = async(id: number) => {
      await workspaceService.deleteSearchGroup(id);
      const groups = keywordGroups.filter((g)=> g.id!== id);
      setKeywordGroups(groups);
  }


  const getGroupKeywords = async () => {  
      const groups = await workspaceService.getAllGroupSearchKeywords();
      setKeywordGroups(groups);
  };

  const onSelectedGroup = async(group: GroupSearchKeyword) =>{
    if (onValueChange) {
      onValueChange(group);
      setKeywordGroups([]);
      setIsOpen(false);
   }
  }

  useEffect(() => {
    getGroupKeywords();
  }
  ,[isOpen]);


  return (


    <div id="Group-keyword-box">
     
          <IconButton  onClick={openMenu} >
           <TocOutlinedIcon></TocOutlinedIcon>
          </IconButton>
      
          {isOpen && ( // Render the menu only if isOpen is true
                <div className="Menu">
                    <div className='keyword-group-container'>
                        <section>
                          <h2>Keyword Groups</h2>
                          <IconButton
                            title={'Add New Group'}
                            tabIndex={-1}
                            color="inherit"
                            size="small"
                          >
                          <AddIcon fontSize="inherit" />
                          </IconButton>
                        </section>
                        <ul>
                            {keywordGroups.map((group,index) => (
                                <li
                                  onClick={(event) => {
                                  event.stopPropagation();
                                  onSelectedGroup(group);
                                }}
                             
                                className={ index%2 ===0 ? "row-group odd": "row-group" } key={group.id}>
                                   <div>
                                      <h4 className='label'>{group.label}</h4>
                                      <ul className='group-box'>
                                          
                                              <li className='words-box'>
                                                {group.words.map((word, index) => (
                                                  <span className='pill'>{word}</span>
                                                  ))}
                                              </li>                                             
                                      </ul>
                                    </div>
                                    <div>
                                        <IconButton
                                            aria-label="delete"
                                            className="btn-delete"
                                            onClick={(event) => {
                                              event.stopPropagation(); 
                                              deleteGroup(group.id);                                               
                                            }}
                                            size="large"
                                            >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    
                        <button onClick={closeMenu}>Close</button> {/* Close button to hide the menu */}
                    </div>
                </div>
            )}      

    </div>
  );
};
