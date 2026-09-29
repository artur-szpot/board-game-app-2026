import {
    Alert,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import axios from "axios";
import type { FC } from "react";
import { Fragment, useState } from "react";

import { SCORE_PLAYERS } from "../../dto/players.enum";
import type { ScoreValues, ScoringRow } from "../../dto/scoring-schema.dto";
import { SCORING_GROUP_MECHANISM_LABELS } from "../../dto/scoring-schema.dto";
import { selectAccessToken } from "../../store/features/currentUserSlice";
import { closeFrame } from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    categorySubtotal,
    grandTotal,
    groupTotal,
} from "../../utils/score-calculation";
import { getScoringIcon } from "../../utils/scoring-icons";
import { MainActions } from "../MainActions";
import type { ScoreEntryScreenPropsFull } from "./ScoreEntryScreenProps";

const players = [...SCORE_PLAYERS];

const RowLabel: FC<{ row: ScoringRow }> = ({ row }) => {
  const icon = getScoringIcon(row.icon);
  if (!icon) {
    return <>{row.name}</>;
  }
  const { Icon, label } = icon;
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Tooltip title={row.name ?? label}>
        <Icon fontSize="small" />
      </Tooltip>
      <span>{row.name}</span>
    </Stack>
  );
};

export const ScoreEntryScreen: FC<ScoreEntryScreenPropsFull> = ({
  frameId,
  gameId,
  gameName,
  schema,
}: ScoreEntryScreenPropsFull) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);

  const [playedOn, setPlayedOn] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [values, setValues] = useState<ScoreValues>({});
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setScore = (rowId: string, player: string, raw: string) => {
    setValues(current => {
      const { [player]: _removed, ...rest } = current[rowId] ?? {};
      if (raw === "" || raw === "-") {
        return { ...current, [rowId]: rest };
      }
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) {
        return current;
      }
      return { ...current, [rowId]: { ...rest, [player]: parsed } };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(undefined);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL as string}/game-api/game-scores`,
        {
          gameId,
          schemaId: schema.id,
          playedOn: new Date(playedOn).toISOString(),
          scores: { players, values },
        },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
        },
      );
      dispatch(closeFrame({ id: frameId }));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save the scores",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-screen">
      <section aria-label="score entry" className="form-screen-section">
        <Paper className="form-screen-card" elevation={8}>
          <Stack spacing={2.5}>
            <Typography component="h2" variant="h5">
              {`${gameName} - ${schema.name}`}
            </Typography>

            <TextField
              label="Played on"
              type="date"
              value={playedOn}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ maxWidth: 220 }}
              onChange={event => {
                setPlayedOn(event.target.value);
              }}
            />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  {players.map(player => (
                    <TableCell key={player} align="center">
                      {player}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {schema.schema.groups.map(group => (
                  <Fragment key={group.id}>
                    {group.categories.map(category => (
                      <Fragment key={category.id}>
                        {category.rows.map(row => (
                          <TableRow key={row.id}>
                            <TableCell>
                              <RowLabel row={row} />
                            </TableCell>
                            {players.map(player => (
                              <TableCell key={player} align="center">
                                <TextField
                                  size="small"
                                  type="number"
                                  slotProps={{
                                    htmlInput: {
                                      "aria-label": `${row.name ?? row.id} for ${player}`,
                                    },
                                  }}
                                  sx={{ width: 84 }}
                                  value={values[row.id]?.[player] ?? ""}
                                  onChange={event => {
                                    setScore(
                                      row.id,
                                      player,
                                      event.target.value,
                                    );
                                  }}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                        {category.rows.length > 1 && (
                          <TableRow>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {`${category.name ?? "Category"} subtotal`}
                              </Typography>
                            </TableCell>
                            {players.map(player => (
                              <TableCell key={player} align="center">
                                {categorySubtotal(category, values, player)}
                              </TableCell>
                            ))}
                          </TableRow>
                        )}
                      </Fragment>
                    ))}
                    <TableRow>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {`${group.name ?? "Group"} (${SCORING_GROUP_MECHANISM_LABELS[group.mechanism]})`}
                        </Typography>
                      </TableCell>
                      {players.map(player => (
                        <TableCell key={player} align="center">
                          <strong>{groupTotal(group, values, player)}</strong>
                        </TableCell>
                      ))}
                    </TableRow>
                  </Fragment>
                ))}
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle1">Total</Typography>
                  </TableCell>
                  {players.map(player => (
                    <TableCell key={player} align="center">
                      <strong>
                        {grandTotal(schema.schema, values, player)}
                      </strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>

            {error && <Alert severity="error">{error}</Alert>}

            <MainActions
              frameId={frameId}
              confirmEnabled={!isSubmitting}
              confirmCallback={() => {
                void handleSubmit();
              }}
            />
          </Stack>
        </Paper>
      </section>
    </div>
  );
};
