import WarningIcon from "@mui/icons-material/Warning";
import { Button } from "@mui/material";
import type { FC } from "react";

import { hasVisibleErrors } from "./common";

export type FormFieldErrorsProps = {
  name: string;
  showErrors?: boolean;
  errors?: string[];
};

export const FormFieldErrors: FC<FormFieldErrorsProps> = ({
  name,
  showErrors,
  errors,
}: FormFieldErrorsProps) => {
  if (!hasVisibleErrors({ showErrors, errors })) {
    return null;
  }

  return (
    <ul className="form-field-errors" id={`${name}-errors`}>
      {(errors ?? []).map(message => (
        <Button
          key={message}
          className="form-field-error"
          component="li"
          variant="contained"
          color="error"
          startIcon={<WarningIcon />}
          disableRipple
          tabIndex={-1}
        >
          {message}
        </Button>
      ))}
    </ul>
  );
};
