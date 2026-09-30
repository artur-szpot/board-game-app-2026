import { Box, Paper, Typography } from "@mui/material";

import type { DisplayStep } from "../../../dto/helper-logic.dto";
import { DisplayElementType } from "../../../dto/helper-logic.dto";
import { type DisplayContext, formatVariable } from "../helper-display";
import type { Variables } from "../helper-engine";
import { OptionButtons } from "../OptionButtons";

type Props = {
  step: DisplayStep;
  variables: Variables;
  context: DisplayContext;
  onReroll: () => void;
  onRestart: () => void;
};

export const DisplayStepView = ({
  step,
  variables,
  context,
  onReroll,
  onRestart,
}: Props) => {
  const { translate } = context;
  return (
    <>
      <Box className="helper-display" component="dl">
        {step.elements.map(element => {
          const values = formatVariable(
            element.variable,
            variables[element.variable],
            context,
          );
          if (!values) {
            return null;
          }
          return (
            <Paper
              key={`${element.variable}-${element.label[0]}`}
              className="helper-display-row"
              variant="outlined"
            >
              <Typography component="dt" variant="subtitle2">
                {translate(element.label)}
              </Typography>
              {element.type === DisplayElementType.LIST ? (
                <Box component="dd" className="helper-display-blocks">
                  {values.map((value, index) => (
                    <span key={index} className="helper-display-block">
                      {value}
                    </span>
                  ))}
                </Box>
              ) : (
                <Typography component="dd" variant="h6">
                  {values[0]}
                </Typography>
              )}
            </Paper>
          );
        })}
      </Box>
      <OptionButtons
        options={[
          {
            key: "reroll",
            label: translate("helper.ui.reroll"),
            onClick: onReroll,
          },
          {
            key: "restart",
            label: translate("helper.ui.restart"),
            color: "secondary",
            onClick: onRestart,
          },
        ]}
      />
    </>
  );
};
