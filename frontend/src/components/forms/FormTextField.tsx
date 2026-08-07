import ClearIcon from "@mui/icons-material/Clear";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { useEffect, useState, type ChangeEvent, type FC } from "react";

import type { FormFieldProps } from "./common";
import { FormFieldType } from "./common";

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
}: {
  name: string;
  label: string;
  required?: boolean;
  initialValue?: string;
}): FormFieldTextProps => ({
  kind: FormFieldType.TEXT,
  label,
  name,
  required,
  initialValue,
});

export const FormTextField: FC<FormFieldTextPropsFull> = ({
  name,
  label,
  required = false,
  onChange,
  onClear,
  value,
}: FormFieldTextPropsFull) => {
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
    <div className="form-text">
      <TextField
        fullWidth
        id={name}
        name={name}
        label={label}
        type="text"
        value={value}
        onChange={handleChange}
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
    </div>
  );
};
