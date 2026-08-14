import ClearIcon from "@mui/icons-material/Clear";
import { IconButton, InputAdornment, TextField } from "@mui/material";
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
};

export type FormFieldTextPropsFull = FormFieldTextProps & {
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
}: {
  name: string;
  label: string;
  required?: boolean;
  initialValue?: string;
  validators?: FieldValidator[];
}): FormFieldTextProps => ({
  kind: FormFieldType.TEXT,
  label,
  name,
  required,
  initialValue,
  validators,
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
        value={value}
        onChange={handleChange}
        error={isErrored}
        slotProps={{
          htmlInput: {
            required,
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
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
