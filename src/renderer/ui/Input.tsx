/* eslint-disable react/require-default-props */
import { Box, Stack, TextField, TextFieldProps, Typography } from '@mui/material';
import { Control, FieldValues, Path, RegisterOptions, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type ControlledInputProps<T extends FieldValues> = TextFieldProps & {
  additionalLabel?: string;
  control: Control<T>;
  label?: string;
  labelPosition?: 'top' | 'left';
  name: Path<T>;
  rules?: RegisterOptions;
};

export default function ControlledInput<T extends FieldValues>({
  additionalLabel,
  control,
  disabled,
  helperText,
  label,
  labelPosition = 'top',
  multiline = false,
  name,
  required = false,
  rows = 1,
  type = 'text',
  variant = 'outlined',
  ...props
}: ControlledInputProps<T>) {
  const { t } = useTranslation();

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required,
      }}
      render={({ field, fieldState: { error } }) => (
        <Box
          display="flex"
          flexDirection={labelPosition === 'top' ? 'column' : 'row'}
          gap={labelPosition === 'top' ? 1 : 2}
        >
          {label && (
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography htmlFor={name} variant="body2" component="label" fontWeight="500" sx={{ textWrap: 'nowrap' }}>
                {t(label)}
              </Typography>
              {additionalLabel && (
                <Typography variant="body2" color="text.secondary">
                  {t(additionalLabel)}
                </Typography>
              )}
            </Stack>
          )}
          <TextField
            {...field}
            {...props}
            helperText={helperText ?? error ? error.message : null}
            error={!!error}
            fullWidth
            disabled={disabled}
            type={type}
            rows={rows}
            multiline={multiline}
            variant={variant}
            size="small"
            name={name}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              '& .MuiInputBase-root': {
                backgroundColor: 'background.paper',
                boxShadow: '0px 1px 3px 0px #0000001A',
              },
            }}
          />
        </Box>
      )}
    />
  );
}
