import ClearIcon from "@mui/icons-material/Clear";
import {
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useEffect, useState, type ChangeEvent, type FC } from "react";

import { useHasRequiredPermissions } from "../../utils/useHasRequiredPermissions";
import type { FormFieldProps } from "./common";
import { FormFieldType, hasVisibleErrors } from "./common";
import { FormFieldErrors } from "./FormFieldErrors";
import type { FieldValidator } from "./validators";

export type FormFieldTextProps = FormFieldProps & {
  kind: FormFieldType.TEXT;
  required?: boolean;
  initialValue?: string;
  multiline?: boolean;
  /** Value must be a JSON object and is submitted parsed. */
  json?: boolean;
};

export type FormFieldTextPropsFull = FormFieldTextProps & {
  readOnly?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  value: string;
};

export const formText = ({
  name,
  label,
  required,
  initialValue,
  validators,
  multiline,
  json,
}: {
  name: string;
  label: string;
  required?: boolean;
  initialValue?: string;
  validators?: FieldValidator[];
  multiline?: boolean;
  json?: boolean;
}): FormFieldTextProps => ({
  kind: FormFieldType.TEXT,
  label,
  name,
  required,
  initialValue,
  validators,
  multiline,
  json,
});

export const FormTextField: FC<FormFieldTextPropsFull> = ({
  name,
  label,
  required = false,
  onChange,
  onClear,
  value,
  requiredPermissions,
  showErrors,
  errors,
  isChecking = false,
  multiline = false,
  readOnly = false,
}: FormFieldTextPropsFull) => {
  const hasRequiredPermissions = useHasRequiredPermissions(requiredPermissions);
  const isErrored = hasVisibleErrors({ showErrors, errors });

  const [isClearable, setIsClearable] = useState(Boolean(value));

  useEffect(() => {
    setIsClearable(Boolean(value));
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setIsClearable(nextValue.length > 0);
    onChange(event);
  };

  const handleClear = () => {
    setIsClearable(false);
    onClear();
  };

  return (
    <div className="form-text" hidden={!hasRequiredPermissions}>
      <TextField
        fullWidth
        id={name}
        name={name}
        label={label}
        type="text"
        multiline={multiline}
        minRows={multiline ? 12 : undefined}
        value={value}
        onChange={readOnly ? undefined : handleChange}
        error={isErrored}
        color={isChecking ? "info" : undefined}
        focused={isChecking || undefined}
        aria-busy={isChecking}
        slotProps={{
          htmlInput: {
            required,
            style: multiline ? { fontFamily: "monospace" } : undefined,
          },
          input: {
            readOnly,
            endAdornment: !readOnly && (
              <InputAdornment position="end">
                {isChecking && (
                  <CircularProgress
                    aria-label={`Checking ${label}`}
                    color="info"
                    size={18}
                    sx={{ mr: 0.5 }}
                  />
                )}
                <IconButton
                  aria-label={`Clear ${label}`}
                  onClick={handleClear}
                  edge="end"
                  size="small"
                  disabled={!isClearable}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <FormFieldErrors name={name} showErrors={showErrors} errors={errors} />
    </div>
  );
};
