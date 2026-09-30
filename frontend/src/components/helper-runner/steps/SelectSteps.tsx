import { Typography } from "@mui/material";
import { useState } from "react";

import type {
    HelperLogic,
    MultiSelectStep,
    SingleSelectStep,
} from "../../../dto/helper-logic.dto";
import type { StepCompletion } from "../helper-engine";
import { enumLabelKey, type Translate } from "../helper-i18n";
import { type OptionButton, OptionButtons } from "../OptionButtons";

type Props<Step> = {
  step: Step;
  logic: HelperLogic;
  translate: Translate;
  onComplete: (completion: StepCompletion) => void;
};

const skipButton = (
  allowSkip: boolean | undefined,
  targetVariable: string,
  translate: Translate,
  onComplete: Props<unknown>["onComplete"],
): OptionButton[] =>
  allowSkip
    ? [
        {
          key: "skip",
          label: translate("helper.ui.skip"),
          color: "secondary",
          onClick: () => onComplete({ values: {}, unset: [targetVariable] }),
        },
      ]
    : [];

export const SingleSelectStepView = ({
  step,
  logic,
  translate,
  onComplete,
}: Props<SingleSelectStep>) => (
  <>
    <Typography variant="h6">
      {translate(step.prompt ?? "helper.ui.chooseOption")}
    </Typography>
    <OptionButtons
      options={[
        ...logic.enums[step.enum].map(value => ({
          key: value,
          label: translate(enumLabelKey(logic, step.enum, value)),
          onClick: () =>
            onComplete({ values: { [step.targetVariable]: value } }),
        })),
        ...skipButton(
          step.allowSkip,
          step.targetVariable,
          translate,
          onComplete,
        ),
      ]}
    />
  </>
);

export const MultiSelectStepView = ({
  step,
  logic,
  translate,
  onComplete,
}: Props<MultiSelectStep>) => {
  const values = logic.enums[step.enum];
  const [chosen, setChosen] = useState<string[]>([]);
  const min = step.min ?? 0;
  const max = step.max ?? values.length;
  const limitError =
    chosen.length < min
      ? translate(["helper.ui.tooFew", { min }])
      : chosen.length > max
        ? translate(["helper.ui.tooMany", { max }])
        : undefined;

  const toggle = (value: string) =>
    setChosen(current =>
      current.includes(value)
        ? current.filter(entry => entry !== value)
        : [...current, value],
    );

  return (
    <>
      <Typography variant="h6">
        {translate(step.prompt ?? "helper.ui.chooseOptions")}
      </Typography>
      <OptionButtons
        options={values.map(value => ({
          key: value,
          label: translate(enumLabelKey(logic, step.enum, value)),
          pressed: chosen.includes(value),
          onClick: () => toggle(value),
        }))}
      />
      <OptionButtons
        options={[
          ...skipButton(
            step.allowSkip,
            step.targetVariable,
            translate,
            onComplete,
          ),
          {
            key: "ok",
            label: limitError ?? translate("helper.ui.ok"),
            disabled: limitError !== undefined,
            onClick: () =>
              onComplete({
                values: {
                  // Keep enum order regardless of click order.
                  [step.targetVariable]: values.filter(value =>
                    chosen.includes(value),
                  ),
                },
              }),
          },
        ]}
      />
    </>
  );
};
