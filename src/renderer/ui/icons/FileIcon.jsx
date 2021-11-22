import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

const FileIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M13.5043 3.4418 10.5547.4922a1.6876 1.6876 0 0 0-1.1918-.4957H2.1875C1.2559 0 .5.7558.5 1.6875v14.625C.5 17.2441 1.2559 18 2.1875 18h10.125C13.2441 18 14 17.2441 14 16.3125V4.6371c0-.4465-.1793-.879-.4957-1.1953ZM12.1754 4.5H9.5V1.8246L12.1754 4.5ZM2.1875 16.3125V1.6875h5.625v3.6562c0 .4676.3762.8438.8438.8438h3.6562v10.125H2.1875Z" />
    </SvgIcon>
  );
};

export default FileIcon;
