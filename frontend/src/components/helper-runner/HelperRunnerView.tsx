import ReplayIcon from "@mui/icons-material/Replay";
import UndoIcon from "@mui/icons-material/Undo";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import type { RandomizerApi } from "../../api/randomizer";
import {
    type HelperLogic,
    HelperStepSchema,
    type SetDataDto,
} from "../../dto/helper-logic.dto";
import { selectAccessToken } from "../../store/features/currentUserSlice";
import { selectLanguage } from "../../store/features/settingsSlice";
import { useAppSelector } from "../../store/hooks";
import { asInteractiveStep, type StepCompletion } from "./helper-engine";
import { DisplayStepView } from "./steps/DisplayStepView";
import { MultiSelectStepView, SingleSelectStepView } from "./steps/SelectSteps";
import { TeamAndPlayersStep } from "./steps/TeamAndPlayersStep";
import { useHelperRunner } from "./useHelperRunner";
import { useHelperTranslations } from "./useHelperTranslations";

import "./helper-runner.scss";

type Props = {
  name: string;
  logic: HelperLogic;
  /** Set data keyed by the helper's set alias. */
  sets: Record<string, SetDataDto>;
  api: RandomizerApi;
  onClose?: () => void;
};

export const HelperRunnerView = ({
  name,
  logic,
  sets,
  api,
  onClose,
}: Props) => {
  const accessToken = useAppSelector(selectAccessToken);
  const language = useAppSelector(selectLanguage);
  const { translate, missing } = useHelperTranslations(
    logic,
    sets,
    language,
    accessToken,
  );
  const { state, dispatch } = useHelperRunner(logic, sets, api, accessToken);
  const step = asInteractiveStep(logic.steps[state.stepIndex]);

  const complete = (completion: StepCompletion) =>
    dispatch({ type: "COMPLETE_STEP", completion });

  const renderStep = () => {
    if (state.phase === "error") {
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => dispatch({ type: "RETRY" })}>
              {translate("helper.ui.reroll")}
            </Button>
          }
        >
          {state.error}
        </Alert>
      );
    }
    if (state.phase === "randomizing" || !step) {
      return (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={24} />
          <Typography>{translate("helper.ui.randomizing")}</Typography>
        </Stack>
      );
    }
    switch (step.schema) {
      case HelperStepSchema.TEAM_AND_PLAYERS:
        return (
          <TeamAndPlayersStep
            key={state.stepIndex}
            step={step}
            translate={translate}
            api={api}
            accessToken={accessToken}
            onComplete={complete}
          />
        );
      case HelperStepSchema.SINGLE_SELECT:
        return (
          <SingleSelectStepView
            key={state.stepIndex}
            step={step}
            logic={logic}
            translate={translate}
            onComplete={complete}
          />
        );
      case HelperStepSchema.MULTI_SELECT:
        return (
          <MultiSelectStepView
            key={state.stepIndex}
            step={step}
            logic={logic}
            translate={translate}
            onComplete={complete}
          />
        );
      case HelperStepSchema.DISPLAY:
        return (
          <DisplayStepView
            step={step}
            variables={state.variables}
            context={{ logic, sets, roster: state.roster, translate }}
            onReroll={() => dispatch({ type: "REROLL" })}
            onRestart={() => dispatch({ type: "RESTART" })}
          />
        );
    }
  };

  return (
    <Paper className="helper-runner" elevation={2}>
      <Box className="helper-runner-header">
        <Typography variant="h5" component="h1">
          {name}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<UndoIcon />}
            disabled={state.history.length === 0}
            onClick={() => dispatch({ type: "BACK" })}
          >
            {translate("helper.ui.back")}
          </Button>
          <Button
            startIcon={<ReplayIcon />}
            onClick={() => dispatch({ type: "RESTART" })}
          >
            {translate("helper.ui.restart")}
          </Button>
          {onClose && <Button onClick={onClose}>Close</Button>}
        </Stack>
      </Box>
      {missing.length > 0 && (
        <Alert severity="warning" className="helper-runner-warning">
          Missing translations: {missing.join(", ")}
        </Alert>
      )}
      <Box className="helper-runner-body">{renderStep()}</Box>
    </Paper>
  );
};
