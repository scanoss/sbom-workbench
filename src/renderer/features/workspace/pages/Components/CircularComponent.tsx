import { Box, CircularProgress, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';

export type CircularComponentProps = {
  sx: SxProps;
};


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
    backgroundColor: '#FEFFFE',
    zIndex: -1,
    borderRadius: '50%',
  },
  containerInsideCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  percentageNumber: {
    fontSize: '4em',
    color: '#7D01F7',
    fontWeight: 'bold',
  },
  stage: {
    color: '#71717A',
    fontSize: '1em',
  }

});


const CircularComponent = (props) => {

  const classes = useStyles();

    return (
    <Box className={classes.parentBox}>
      <Box className={classes.circleParentBox}>
            <CircularProgress
              variant="determinate"
              className={classes.trackCircularProgress}
              size={'30vw'}
              thickness={4}
              value={100}
            />
          <CircularProgress
            variant="indeterminate"
            size={'30vw'}
            thickness={4}
            className={classes.circularProgress}
            disableShrink />
        </Box>
    <Box
      className={classes.typographyContainer}
    >
     <div className={classes.containerInsideCircle}>
       <span className={classes.percentageNumber}>
         12%
       </span>
       <span className={classes.stage}>
         SCANNING
       </span>
     </div>
    </Box>
  </Box>
    )
}

export default CircularComponent
