import {
  Autocomplete,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Controller, useFormContext, type Path, type FieldValues } from 'react-hook-form';
import dayjs, { type Dayjs } from 'dayjs';

interface Option {
  value: string | number;
  label: string;
}

export function TextInput<T extends FieldValues>({
  name,
  label,
  type,
  multiline,
  required,
  rows,
}: {
  name: Path<T>;
  label: string;
  type?: string;
  multiline?: boolean;
  required?: boolean;
  rows?: number;
}) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label={label}
          type={type}
          multiline={multiline}
          rows={rows}
          required={required}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
          fullWidth
          size="small"
        />
      )}
    />
  );
}

export function NumberInput<T extends FieldValues>({
  name,
  label,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      name={name as Path<T>}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label={label}
          type="number"
          required={required}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
          fullWidth
          size="small"
          onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
      )}
    />
  );
}

export function SelectInput<T extends FieldValues>({
  name,
  label,
  options,
  required,
}: {
  name: Path<T>;
  label: string;
  options: Option[];
  required?: boolean;
}) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth size="small" required={required} error={Boolean(fieldState.error)}>
          <InputLabel>{label}</InputLabel>
          <Select {...field} label={label} value={field.value ?? ''}>
            {options.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
          {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}

export function MultiSelectInput<T extends FieldValues>({
  name,
  label,
  options,
}: {
  name: Path<T>;
  label: string;
  options: Option[];
}) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth size="small" error={Boolean(fieldState.error)}>
          <InputLabel>{label}</InputLabel>
          <Select {...field} label={label} multiple value={(field.value as (string | number)[]) ?? []}>
            {options.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
          {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}

export function DateField<T extends FieldValues>({ name, label }: { name: Path<T>; label: string }) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker
          label={label}
          value={field.value ? dayjs(field.value) : null}
          onChange={(v: Dayjs | null) => field.onChange(v ? v.format('YYYY-MM-DD') : null)}
          slotProps={{ textField: { fullWidth: true, size: 'small', error: Boolean(fieldState.error) } }}
        />
      )}
    />
  );
}

export function DateTimeField<T extends FieldValues>({ name, label }: { name: Path<T>; label: string }) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DateTimePicker
          label={label}
          value={field.value ? dayjs(field.value) : null}
          onChange={(v: Dayjs | null) => field.onChange(v ? v.toISOString() : null)}
          slotProps={{ textField: { fullWidth: true, size: 'small', error: Boolean(fieldState.error) } }}
        />
      )}
    />
  );
}

export function AutocompleteField<T extends FieldValues>({
  name,
  label,
  options,
}: {
  name: Path<T>;
  label: string;
  options: Option[];
}) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete
          size="small"
          options={options}
          getOptionLabel={(o) => (typeof o === 'object' ? o.label : String(o))}
          value={options.find((o) => o.value === field.value) ?? null}
          onChange={(_, val) => field.onChange(val ? val.value : null)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              size="small"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />
      )}
    />
  );
}

export function BoolField<T extends FieldValues>({ name, label }: { name: Path<T>; label: string }) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={<Checkbox checked={Boolean(field.value)} onChange={(e) => field.onChange(e.target.checked)} />}
          label={label}
        />
      )}
    />
  );
}
