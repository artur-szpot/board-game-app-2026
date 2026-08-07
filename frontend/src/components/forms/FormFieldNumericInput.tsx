import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import AddIcon from "@mui/icons-material/Add";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import RemoveIcon from "@mui/icons-material/Remove";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import type { FC } from "react";

import type { FormFieldProps } from "./common";
import { FormFieldType } from "./common";

export type FormFieldNumericInputProps = FormFieldProps & {
  kind: FormFieldType.NUMERIC;
  required?: boolean;
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
};

export type FormFieldNumericInputPropsFull = FormFieldNumericInputProps & {
  value: number | null;
  onChange: (value: number | null) => void;
};

export const formNumber = ({
  name,
  label,
  required,
  initialValue,
  min,
  max,
  step,
}: {
  name: string;
  label: string;
  required?: boolean;
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
}): FormFieldNumericInputProps => ({
  kind: FormFieldType.NUMERIC,
  label,
  name,
  required,
  initialValue,
  min,
  max,
  step,
});

export const FormFieldNumericInput: FC<FormFieldNumericInputPropsFull> = ({
  name,
  label,
  required = false,
  min,
  max,
  step,
  value,
  onChange,
}: FormFieldNumericInputPropsFull) => {
  const id = `${name}-numeric-input`;

  return (
    <div className="form-numeric-input">
      <BaseNumberField.Root
        value={value}
        onValueChange={onChange}
        required={required}
        min={min}
        max={max}
        step={step}
        name={name}
        render={(props, state) => (
          <FormControl
            ref={props.ref}
            disabled={state.disabled}
            required={state.required}
            variant="outlined"
            sx={{
              width: "100%",
              "& .MuiButton-root": {
                borderColor: "divider",
                minWidth: 0,
                bgcolor: "action.hover",
                "&:not(.Mui-disabled)": {
                  color: "text.primary",
                },
              },
            }}
          >
            {props.children}
          </FormControl>
        )}
      >
        <BaseNumberField.ScrubArea
          render={
            <Box
              component="span"
              sx={{ userSelect: "none", width: "max-content" }}
            />
          }
        >
          <FormLabel
            htmlFor={id}
            sx={{
              display: "inline-block",
              cursor: "ew-resize",
              fontSize: "0.875rem",
              color: "text.primary",
              fontWeight: 500,
              lineHeight: 1.5,
              mb: 0.5,
            }}
          >
            {label}
          </FormLabel>
          <BaseNumberField.ScrubAreaCursor>
            <OpenInFullIcon
              fontSize="small"
              sx={{ transform: "translateY(12.5%) rotate(45deg)" }}
            />
          </BaseNumberField.ScrubAreaCursor>
        </BaseNumberField.ScrubArea>

        <Box sx={{ display: "flex", flex: 1 }}>
          <BaseNumberField.Decrement
            render={
              <Button
                variant="outlined"
                aria-label="Decrease"
                sx={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderRight: "0px",
                  "&.Mui-disabled": {
                    borderRight: "0px",
                  },
                }}
              />
            }
          >
            <RemoveIcon />
          </BaseNumberField.Decrement>

          <BaseNumberField.Input
            id={id}
            render={(props, state) => (
              <OutlinedInput
                inputRef={props.ref}
                value={state.inputValue}
                onBlur={props.onBlur}
                onChange={props.onChange}
                onKeyUp={props.onKeyUp}
                onKeyDown={props.onKeyDown}
                onFocus={props.onFocus}
                slotProps={{
                  input: {
                    ...props,
                    size:
                      Math.max(
                        (min?.toString() ?? "").length,
                        state.inputValue.length || 1,
                      ) + 1,
                    sx: {
                      textAlign: "center",
                    },
                  },
                }}
                sx={{ pr: 0, borderRadius: 0, flex: 1 }}
              />
            )}
          />

          <BaseNumberField.Increment
            render={
              <Button
                variant="outlined"
                aria-label="Increase"
                sx={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderLeft: "0px",
                  "&.Mui-disabled": {
                    borderLeft: "0px",
                  },
                }}
              />
            }
          >
            <AddIcon />
          </BaseNumberField.Increment>
        </Box>
      </BaseNumberField.Root>
    </div>
  );
};
