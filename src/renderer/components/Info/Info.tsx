import React from 'react';
import { makeStyles } from '@mui/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const useStyles = makeStyles((theme) => ({
  root: {

  },

}));

export interface InfoProps {
  message: string;
  icon?: any;
}

const Info = ({ message, icon }: InfoProps) => {
  const classes = useStyles();

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
