import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import { ScannerStage } from '@api/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';

interface CircularComponentProps {
  stage: {
    stageName: ScannerStage;
    stageLabel: string;
    stageStep: number;
  };
  progress: number;
  pauseScan: () => void;
}

const trackColor = '#D4D4D8';
const textColor = '#71717A';
const backgroundColor = '#fefffe';


const CircularComponent = ({
  stage,
  progress,
  pauseScan,
}: CircularComponentProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const variant =
    stage.stageName === ScannerStage.UNZIP ||
    stage.stageName === ScannerStage.INDEX ||
    stage.stageName === ScannerStage.VULNERABILITY ||
    stage.stageName === ScannerStage.DEPENDENCY ||
    stage.stageName === ScannerStage.CRYPTOGRAPHY ||
    stage.stageName === ScannerStage.LOCAL_CRYPTOGRAPHY
      ? 'indeterminate'
      : 'determinate';

  const noProgress =
    stage.stageName === ScannerStage.DEPENDENCY ||
    stage.stageName === ScannerStage.VULNERABILITY ||
    stage.stageName === ScannerStage.UNZIP ||
    stage.stageName === ScannerStage.CRYPTOGRAPHY ||
    stage.stageName === ScannerStage.LOCAL_CRYPTOGRAPHY;

  const resumeEnable =
    stage.stageName === ScannerStage.SCAN ||
    stage.stageName === ScannerStage.RESUME ||
    stage.stageName === ScannerStage.RESCAN;

  return (
    <Box
      sx={{
        position: 'relative',
        marginBottom: 5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress
          variant="determinate"
          sx={{
            color: trackColor,
            background: backgroundColor,
            borderRadius: '50%',
          }}
          size="340px"
          thickness={3}
          value={100}
        />
        <CircularProgress
          variant={variant}
          size="340px"
          thickness={3}
          sx={{
            color: theme.palette.primary.main,
            position: 'absolute',
          }}
          {...{ value: progress }}
        />
      </Box>
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            marginTop: '50px',
          }}
        >
          <Box
            sx={{
              fontSize: '4em',
              color: theme.palette.primary.main,
              fontWeight: 'bold',
            }}
          >
            {!noProgress ? Math.round(progress) : <>-</>}
            {variant === 'determinate' ? '%' : ''}
          </Box>
          <Box
            sx={{
              color: textColor,
              fontSize: '1em',
            }}
            className="text-uppercase">
            {stage.stageLabel}
          </Box>
          <Box
            sx={{
              fontWeight: 'bold',
              fontSize: '0.8em',
              marginTop: '2px',
            }}
            className="text-uppercase"
          >{t('Title:Stage')} {stage.stageStep}</Box>
        </Box>
        <Box
          sx={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            disabled={!resumeEnable}
            startIcon={<PauseIcon />}
            onClick={pauseScan}
          >
            <Box
              sx={{
                color: textColor,
                zIndex: 5,
              }}
            >{t('Button:PAUSE')}</Box>
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CircularComponent;
