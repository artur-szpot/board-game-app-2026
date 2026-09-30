import { Box, Button } from "@mui/material";

export type OptionButton = {
  key: string;
  label: string;
  onClick: () => void;
  /** Toggle buttons render as pressed/unpressed; plain buttons omit it. */
  pressed?: boolean;
  disabled?: boolean;
  color?: "primary" | "secondary" | "error";
};

export const OptionButtons = ({ options }: { options: OptionButton[] }) => (
  <Box className="helper-option-buttons">
    {options.map(option => (
      <Button
        key={option.key}
        size="large"
        variant={option.pressed === false ? "outlined" : "contained"}
        color={option.color ?? "primary"}
        aria-pressed={option.pressed}
        disabled={option.disabled}
        onClick={option.onClick}
      >
        {option.label}
      </Button>
    ))}
  </Box>
);
