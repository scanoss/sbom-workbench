import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export interface InfoProps {
  message: string;
  icon?: any;
}

const Info = ({ message, icon }: InfoProps) => {


  return (
    <section className="loader">
      <div className="text-center">
        {icon || <InfoOutlinedIcon fontSize="large" /> }
        <p className="m-0 mt-1 font-medium">
          <small>{ message }</small>
        </p>
      </div>
    </section>
  );
};

Info.defaultProps = { icon: null};

export default Info;
