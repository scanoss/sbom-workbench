import React from 'react';
import Label from '../Label/Label';

interface LabelType {
  labelOfCard: string | null;
}

const MatchCard = ({ labelOfCard, status }) => {
  return (
    <div className={`match-card-${status.toLowerCase()}`}>
      <div>
        <Label label={labelOfCard} textColor="black" />
      </div>
    </div>
  );
};

export default MatchCard;
