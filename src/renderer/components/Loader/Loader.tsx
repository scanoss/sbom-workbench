import React from 'react';
import { CircularProgress } from '@mui/material';

export interface LoaderProps {
  message?: string;
  size?: number;
}

const Loader = ({ message, size }: LoaderProps) => {

  return (
    <section className="loader">
      <div className="text-center">
        <CircularProgress size={size} />
        <p className="m-0 mt-1 font-medium">
          <small>{ message }</small>
        </p>
      </div>
    </section>
  );
};

Loader.defaultProps = { message: 'Loading', size: 34 };

export default Loader;
