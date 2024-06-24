import { useEffect, useRef, useState } from 'react';
import { GroupSearchKeyword } from '@api/types';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import TocOutlinedIcon from '@mui/icons-material/TocOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { workspaceService } from '@api/services/workspace.service';
import { KeywordGroupDialog } from '../KeywordGroupDialog/KeywordGroupDialog';
import SearchBox from '@components/SearchBox/SearchBox';


export const KeywordGroupMenu = ({ onValueChange }) => {


  const filter = (groups: Array<GroupSearchKeyword>, searchQuery: string | null)=>{
    if(!searchQuery)return groups;

    const filteredGroups = groups.filter((g: GroupSearchKeyword)=>{
      const labelToLower = g.label.toLowerCase();
      if(g.label.includes(searchQuery)) return g;
      return null;
    });
  
    return filteredGroups;
  }

  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [keywordGroups, setKeywordGroups] = useState<Array<GroupSearchKeyword>>([]);
  const [groupMap, setGroupMap] = useState<Set<string>>(new Set());
  const [isEditGroup, setIsEditGroup] = useState<boolean>(false);
  const [groupEdit, setGroupEdit] = useState<GroupSearchKeyword>(null);

  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const filterItems = filter(keywordGroups, searchQuery);

  const setGroups = (groups: Array<GroupSearchKeyword>) => {
    const groupMapper =  new Set<string>();  
    groups.forEach((g)=>{
      groupMapper.add(g.label);
    });
    setGroupMap(groupMapper);
    setKeywordGroups(groups);
  };

  const reset = ()=>{
    setIsEditGroup(false);
  };


  const openMenu = () => {
      setIsOpen(true);
  };

  const closeMenu = () => {
     reset();
     setIsOpen(false);
  };

  const deleteGroup = async(id: number) => {
      await workspaceService.deleteSearchGroup(id);
      const groups = keywordGroups.filter((g)=> g.id!== id);
      setGroups(groups);
  }

  const search = (value: string) => {

    setSearchQuery(value);

  }


  const handleNewGroup = ()=> {
    setShowNewGroup(!showNewGroup);
  }

  const getGroupKeywords = async () => {  
      const groups = await workspaceService.getAllGroupSearchKeywords();
      setGroups(groups);
  };

  const onSelectedGroup = async(group: GroupSearchKeyword) =>{
    if (onValueChange) {
      setGroupEdit(null);
      onValueChange(group);
      setKeywordGroups([]);
      setIsOpen(false);
   }
  }

  const editGroup = (group: GroupSearchKeyword) => {
    setGroupEdit(group);
    setIsEditGroup(true);
    if(!showNewGroup) handleNewGroup();
  }

  const onCancelGroup = () =>{
    reset();
    handleNewGroup();
  }

  const onGroupCreated = async()=>{
    await getGroupKeywords();
    handleNewGroup();
    setIsEditGroup(false);
  }

  useEffect(() => {
    getGroupKeywords();
  }
  ,[isOpen]);


  return (
    <div id="Group-keyword-box">     
      <IconButton
        title={'Keyword Groups'}
        onClick={openMenu} >
        <TocOutlinedIcon></TocOutlinedIcon>
      </IconButton>
  
      {isOpen && ( // Render the menu only if isOpen is true
            <div className="Menu">
                <div className='dialog-bar'>   
                      <div>  
                        <span>Keyword Groups</span>      
                      </div>                           
                      <IconButton
                      aria-label="close"
                      size="small"
                      onClick={closeMenu}
                    >
                      <CloseIcon />
                    </IconButton>                  
                </div>
                <div className='keyword-group-container'>
                  <article className={`${showNewGroup ? 'hide'  : 'new-group-bar' }`}>
                      <section className='search-box'>
                        <SearchBox onChange={(value) => search(value.trim().toLowerCase())} />
                      </section>
                      <section>                         
                        <div className='add-new-group-btn-box'>
                          <IconButton
                            title={'Add New Group'}
                            tabIndex={-1}
                            color="inherit"
                            size="medium"
                            disabled={showNewGroup}                              
                            onClick={handleNewGroup}
                          >
                            <AddIcon fontSize="inherit" />
                          </IconButton>
                        </div>
                      </section>
                    </article>
                    <section className={`newGroup-box ${showNewGroup ? '' : 'hide'}`}>
                        <KeywordGroupDialog isEditMode={isEditGroup} groupMapper={groupMap}  groupEdit={groupEdit} onGroupCreated={onGroupCreated} isOpen={showNewGroup} onCancel={onCancelGroup}></KeywordGroupDialog>
                    </section>
                    { filterItems.length > 0 ? ( 
                        <ul>
                            {filterItems.map((group,index) => (
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
                                              editGroup(group);                                               
                                            }}
                                            size="small"
                                            >
                                            <ModeEditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            aria-label="delete"
                                            className="btn-delete"
                                            onClick={(event) => {
                                              event.stopPropagation(); 
                                              deleteGroup(group.id);                                               
                                            }}
                                            size="small"
                                            >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </div>
                                </li>
                            ))}
                          </ul> 
                    ):
                    (                    
                      <div className='no-groups-available'>
                       <p>No groups available</p>
                      </div>                  
                    )}
                
                </div>
            </div>
      )}
    </div>
  );
};


