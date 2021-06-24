/* eslint-disable no-nested-ternary */
import React from 'react';

interface PillType {
  state: string;
}

const Pill = ({ state }: PillType) => {
  return (
    <div
      className={
        state.toLowerCase() === 'pending'
          ? 'pending-pill'
          : state.toLowerCase() === 'identified'
          ? 'identified-pill'
          : state.toLowerCase() === 'ignored'
          ? 'ignored-pill'
          : 'null'
      }
    >
      <span>{state}</span>
    </div>
  );
};

export default Pill;
