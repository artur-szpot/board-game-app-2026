import { Alert, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import type { NamedItem, RandomizerApi } from "../../../api/randomizer";
import {
    PLAYERS_VARIABLE,
    TEAM_VARIABLE,
    type TeamAndPlayersStep as TeamAndPlayersStepDto,
} from "../../../dto/helper-logic.dto";
import { rosterVariables, type StepCompletion } from "../helper-engine";
import type { Translate } from "../helper-i18n";
import { type OptionButton, OptionButtons } from "../OptionButtons";

type Props = {
  step: TeamAndPlayersStepDto;
  translate: Translate;
  api: RandomizerApi;
  accessToken?: string;
  onComplete: (completion: StepCompletion) => void;
};

type PlayerChoice = { player: NamedItem; chosen: boolean };

export const TeamAndPlayersStep = ({
  step,
  translate,
  api,
  accessToken,
  onComplete,
}: Props) => {
  const [teams, setTeams] = useState<NamedItem[] | undefined>();
  const [team, setTeam] = useState<NamedItem | undefined>();
  const [players, setPlayers] = useState<PlayerChoice[] | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    api
      .getTeams(accessToken)
      .then(result => !cancelled && setTeams(result))
      .catch(() => !cancelled && setError("Unable to load teams"));
    return () => {
      cancelled = true;
    };
  }, [accessToken, api]);

  const chooseTeam = (chosenTeam: NamedItem) => {
    setTeam(chosenTeam);
    setPlayers(undefined);
    api
      .getPlayers(chosenTeam.id, accessToken)
      .then(result =>
        setPlayers(result.map(player => ({ player, chosen: true }))),
      )
      .catch(() => setError("Unable to load players"));
  };

  const skipOption: OptionButton[] = step.allowSkip
    ? [
        {
          key: "skip",
          label: translate("helper.ui.skip"),
          color: "secondary",
          onClick: () =>
            onComplete({
              values: {},
              unset: [TEAM_VARIABLE, PLAYERS_VARIABLE],
              roster: undefined,
            }),
        },
      ]
    : [];

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!team) {
    return (
      <>
        <Typography variant="h6">
          {translate(step.prompt ?? "helper.ui.chooseTeam")}
        </Typography>
        {teams ? (
          <OptionButtons
            options={[
              ...teams.map(option => ({
                key: option.id,
                label: option.name,
                onClick: () => chooseTeam(option),
              })),
              ...skipOption,
            ]}
          />
        ) : (
          <CircularProgress aria-label="Loading teams" />
        )}
      </>
    );
  }

  if (!players) {
    return <CircularProgress aria-label="Loading players" />;
  }

  const chosen = players.filter(entry => entry.chosen);
  const limitError =
    chosen.length < step.minPlayers
      ? translate(["helper.ui.tooFew", { min: step.minPlayers }])
      : chosen.length > step.maxPlayers
        ? translate(["helper.ui.tooMany", { max: step.maxPlayers }])
        : undefined;

  const togglePlayer = (id: string) =>
    setPlayers(
      players.map(entry =>
        entry.player.id === id ? { ...entry, chosen: !entry.chosen } : entry,
      ),
    );

  const confirm = () => {
    const roster = { team, players: chosen.map(entry => entry.player) };
    onComplete({ values: rosterVariables(roster), roster });
  };

  return (
    <>
      <Typography variant="h6">
        {translate("helper.ui.choosePlayers")} ({team.name})
      </Typography>
      <OptionButtons
        options={players.map(entry => ({
          key: entry.player.id,
          label: entry.player.name,
          pressed: entry.chosen,
          onClick: () => togglePlayer(entry.player.id),
        }))}
      />
      <OptionButtons
        options={[
          {
            key: "change-team",
            label: translate("helper.ui.chooseTeam"),
            color: "secondary",
            onClick: () => setTeam(undefined),
          },
          {
            key: "ok",
            label: limitError ?? translate("helper.ui.ok"),
            disabled: limitError !== undefined,
            onClick: confirm,
          },
        ]}
      />
    </>
  );
};
