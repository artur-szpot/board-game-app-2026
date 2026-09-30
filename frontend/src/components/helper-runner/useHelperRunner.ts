import { useEffect, useReducer } from "react";

import type { RandomizerApi } from "../../api/randomizer";
import type { HelperLogic, SetDataDto } from "../../dto/helper-logic.dto";
import {
    automaticTargets,
    initialRunnerState,
    planRandomization,
    runnerReducer,
    runRandomization,
} from "./helper-engine";

export const useHelperRunner = (
  logic: HelperLogic,
  sets: Record<string, SetDataDto>,
  api: RandomizerApi,
  accessToken?: string,
) => {
  const [state, dispatch] = useReducer(
    runnerReducer,
    undefined,
    initialRunnerState,
  );

  useEffect(() => {
    if (state.phase !== "randomizing") {
      return;
    }
    let cancelled = false;
    const plan = planRandomization(logic, state);
    const baseVariables = state.reroll
      ? Object.fromEntries(
          Object.entries(state.variables).filter(
            ([key]) => !automaticTargets(logic).includes(key),
          ),
        )
      : state.variables;

    runRandomization(plan, baseVariables, { logic, sets, api, accessToken })
      .then(values => {
        if (!cancelled) {
          dispatch({
            type: "RANDOMIZED",
            values,
            cleared: state.reroll ? automaticTargets(logic) : [],
            nextIndex: plan.nextIndex,
          });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          dispatch({
            type: "FAIL",
            error:
              error instanceof Error ? error.message : "Randomization failed",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, api, logic, sets, state]);

  return { state, dispatch };
};
