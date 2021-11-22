import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import parentOpen from '../../../../../../assets/imgs/folder-open.svg';

const FolderOpen = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M16.3125 4.5H9.5625L7.64191 2.57941C7.43098 2.36848 7.1448 2.25 6.84633 2.25H1.6875C0.755508 2.25 0 3.00551 0 3.9375V14.0625C0 14.9945 0.755508 15.75 1.6875 15.75H16.3125C17.2445 15.75 18 14.9945 18 14.0625V6.1875C18 5.25551 17.2445 4.5 16.3125 4.5ZM16.3125 14.0625H1.6875V3.9375H6.61359L8.53418 5.85809C8.74512 6.06902 9.03129 6.1875 9.32977 6.1875H16.3125V14.0625Z" />
    </SvgIcon>
  );
};

export default FolderOpen;
