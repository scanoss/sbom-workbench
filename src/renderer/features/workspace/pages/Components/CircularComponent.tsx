import { Box, CircularProgress, IconButton, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import PauseIcon from '@material-ui/icons/Pause';



interface CircularComponentProps {
  stage: String;
  progress: Number;
  pauseScan: () => void;
}


const CircularComponent = ({stage, progress, pauseScan}: CircularComponentProps) => {

  console.log(progress);

  const variant = (stage === 'preparing' || stage === 'indexing') ? 'indeterminate' : 'determinate';

  const classes = useStyles();

    return (
    <div className={classes.parentBox}>
      <div className={classes.circleParentBox}>
            <CircularProgress
              variant="determinate"
              className={classes.trackCircularProgress}
              size={'400px'}
              thickness={3}
              value={100}
            />
          <CircularProgress
            variant={variant}
            size={'400px'}
            thickness={3}
            className={classes.circularProgress}
            disableShrink
            {...{value: progress}}
            />
        </div>
    <div
      className={classes.typographyContainer}
    >
      <div className={classes.numberStageContainer}>
        <span className={classes.number}>
          {Math.round(progress)}{variant === 'determinate' ? '%' : ''}
        </span>
        <span className={classes.stage}>
          {stage.toUpperCase()}
        </span>
      </div>
      <div className={classes.pauseContainer}>
        <IconButton onClick={() => pauseScan()}>
          <PauseIcon />
          <span className={classes.pause}>Pause</span>
        </IconButton> 
      </div>
    </div>
  </div>
    )
}

const useStyles = makeStyles({
  parentBox: {
    position: 'relative',
  },
  circleParentBox: {
    display: 'flex',
    alignItems: 'center',  
    justifyContent: 'center', 
  },
  trackCircularProgress: {
    color: '#d5d2d8',
    background: '#fefffe',
    borderRadius: '50%',
  },
  circularProgress: {
    color: '#7D01F7',
    position: 'absolute',
  },
  typographyContainer: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  numberStageContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  number: {
    fontSize: '4em',
    color: '#7D01F7',
    fontWeight: 'bold',
  },
  stage: {
    color: '#71717A',
    fontSize: '1em',
  },
  pause: {
    color: '#71717A',
    fontSize: '0.75em',
    zIndex: 5,
  },
  pauseContainer: {
    marginTop: '5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});


export default CircularComponent
