import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

const FolderOpenIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <g clip-path="url(#a)">
        <path
          d="M18.559 7.875h-1.684V6.187c0-.931-.756-1.687-1.688-1.687H9.564l-2.25-2.25H1.688C.755 2.25 0 3.006 0 3.938v10.124c0 .932.756 1.688 1.688 1.688H15.75c.58 0 1.122-.299 1.43-.794l2.81-4.5c.703-1.122-.106-2.581-1.431-2.581ZM1.687 4.148c0-.116.095-.21.211-.21h4.715l2.25 2.25h6.114c.116 0 .21.094.21.21v1.477H5.345c-.59 0-1.14.31-1.445.816l-2.212 3.663V4.148Zm14.063 9.915H2.531l2.714-4.5h13.317l-2.812 4.5Z"
          fill="#52525B"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h20.25v18H0z" />
        </clipPath>
      </defs>
    </SvgIcon>
  );
};

export default FolderOpenIcon;
