import React from 'react';
import { CircularProgress, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PauseIcon from '@mui/icons-material/Pause';

interface CircularComponentProps {
  stage: {
    stageName: string;
    stageStep: number;
  };
  progress: number;
  pauseScan: () => void;
}

const trackColor = '#D4D4D8';
const textColor = '#71717A';
const backgroundColor = '#fefffe';

const useStyles = makeStyles((theme) => ({
  parentBox: {
    position: 'relative',
    marginBottom: 60,
  },
  circleParentBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackCircularProgress: {
    color: trackColor,
    background: backgroundColor,
    borderRadius: '50%',
  },
  circularProgress: {
    color: theme.palette.primary.main,
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
    marginTop: '50px',
  },
  number: {
    fontSize: '4em',
    color: theme.palette.primary.main,
    fontWeight: 'bold',
  },
  stage: {
    color: textColor,
    fontSize: '1em',
  },
  pause: {
    color: textColor,
    zIndex: 5,
  },
  pauseContainer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageStep: {
    fontWeight: 'bold',
    fontSize: '0.8em',
    marginTop: '2px',
  }
}));

const CircularComponent = ({ stage, progress, pauseScan }: CircularComponentProps) => {
  const classes = useStyles();
  const variant = stage.stageName === 'preparing' || stage.stageName === 'indexing' || stage.stageStep === 3 ? 'indeterminate' : 'determinate';

  return (
    <div className={classes.parentBox}>
      <div className={classes.circleParentBox}>
        <CircularProgress
          variant="determinate"
          className={classes.trackCircularProgress}
          size="340px"
          thickness={3}
          value={100}
        />
        <CircularProgress
          variant={variant}
          size="340px"
          thickness={3}
          className={classes.circularProgress}
          {...{ value: progress }}
        />
      </div>
      <div className={classes.typographyContainer}>
        <div className={classes.numberStageContainer}>
          <span className={classes.number}>
            {stage.stageStep !== 3 ? Math.round(progress) : <>-</>}
            {variant === 'determinate' ? '%' : ''}
          </span>
          <span className={classes.stage}>{stage.stageName.toUpperCase()}</span>
          <span className={classes.stageStep}>STAGE {stage.stageStep}/5</span>
        </div>
        <div className={classes.pauseContainer}>
          <Button disabled={stage.stageStep !== 2} startIcon={<PauseIcon />} onClick={pauseScan}>
            <span className={classes.pause}>PAUSE</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CircularComponent;
