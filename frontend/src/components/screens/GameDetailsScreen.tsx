import CasinoIcon from "@mui/icons-material/Casino";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ScoreboardIcon from "@mui/icons-material/Scoreboard";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import type {
  GameResponseDto,
  SetResponseDto,
} from "../../dto/collection-items.dto";
import type { GameScoreResponseDto } from "../../dto/scoring-schema.dto";
import { PermissionLevel, PermissionType } from "../../dto/user-data.dto";
import {
  selectAccessToken,
  selectPermissions,
  selectUserId,
} from "../../store/features/currentUserSlice";
import { resultMapper } from "../../store/features/frame-actions";
import {
  closeFrame,
  openFormFrame,
  openOptionsFrame,
  openScoreEntryFrame,
  openSetEditorFrame,
} from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useListSearch } from "../../utils/list-return-state";
import { grandTotal } from "../../utils/score-calculation";
import { hasRequiredPermissions } from "../../utils/useHasRequiredPermissions";
import { buildEditHelperScreen } from "./definitions/helpers-and-sets";
import { extractApiErrorMessages } from "../../utils/api-error";
import { buildEditGameScreen } from "./definitions/edit-game";
import type { GameBadgeProps } from "./GameBadge";
import { BadgeTypeEnum, GameBadge } from "./GameBadge";
import type { GameDetailsScreenPropsFull } from "./GameDetailsScreenProps";
import {
  GameDataType,
  selectionStrategyChooseOne,
} from "./selection-strategies";

export const GameDetailsScreen = ({
  gameId,
  openedAsFrame,
  frameId,
}: GameDetailsScreenPropsFull) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const listSearch = useListSearch();
  const accessToken = useAppSelector(selectAccessToken);
  const permissions = useAppSelector(selectPermissions);
  const userId = useAppSelector(selectUserId);
  const canViewData = hasRequiredPermissions(permissions, {
    [PermissionType.DATA_MANAGEMENT]: PermissionLevel.READ,
  });
  const [game, setGame] = useState<GameResponseDto | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [pastScores, setPastScores] = useState<GameScoreResponseDto[]>([]);
  const [dataViewError, setDataViewError] = useState<string[]>([]);
  const [loadingSetId, setLoadingSetId] = useState<string>();

  const viewSet = async (id: string) => {
    if (!canViewData || loadingSetId) {
      return;
    }
    setLoadingSetId(id);
    setDataViewError([]);
    try {
      const { data } = await axios.get<SetResponseDto>(
        `${import.meta.env.VITE_API_URL as string}/game-api/sets/${id}`,
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
        },
      );
      dispatch(openSetEditorFrame({ params: { set: data, readOnly: true } }));
    } catch (error) {
      setDataViewError(extractApiErrorMessages(error));
    } finally {
      setLoadingSetId(undefined);
    }
  };

  const hasSystemCollectionFullPermission = useMemo(
    () =>
      (permissions ?? []).some(
        permission =>
          permission.permissionType === PermissionType.SYSTEM_COLLECTION &&
          permission.permissionLevel === PermissionLevel.FULL,
      ),
    [permissions],
  );

  const canEditOrDelete = useMemo(() => {
    if (!game) {
      return false;
    }

    const record = game as GameResponseDto & {
      protectedRole?: boolean;
      ownerId?: string;
    };

    if (record.protectedRole === true) {
      return false;
    }

    if (typeof record.ownerId !== "string") {
      return true;
    }

    if (!userId) {
      return false;
    }

    if (record.ownerId === userId) {
      return true;
    }

    return record.ownerId === "SYSTEM" && hasSystemCollectionFullPermission;
  }, [game, hasSystemCollectionFullPermission, userId]);

  useEffect(() => {
    if (!gameId) {
      setGame(undefined);
      setError("Missing game id");
      return;
    }

    const loadGame = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const response = await axios.get<GameResponseDto>(
          `${import.meta.env.VITE_API_URL as string}/game-api/games/${gameId}`,
          {
            headers: accessToken
              ? {
                  Authorization: `Bearer ${accessToken}`,
                }
              : undefined,
          },
        );

        setGame(response.data);
      } catch {
        setGame(undefined);
        setError("Unable to load game details");
      } finally {
        setLoading(false);
      }
    };

    void loadGame();
  }, [accessToken, gameId]);

  useEffect(() => {
    if (!gameId) {
      return;
    }

    const loadScores = async () => {
      try {
        const response = await axios.get<{ page: GameScoreResponseDto[] }>(
          `${import.meta.env.VITE_API_URL as string}/game-api/game-scores`,
          {
            params: { gameId },
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : undefined,
          },
        );
        setPastScores(response.data.page);
      } catch {
        setPastScores([]);
      }
    };

    void loadScores();
  }, [accessToken, gameId]);

  const scoringSchemas = game?.scoringSchemas ?? [];

  const openScoreEntry = useCallback(
    (schema: GameResponseDto["scoringSchemas"][number]) => {
      if (!game) {
        return;
      }
      dispatch(
        openScoreEntryFrame({
          params: { gameId: game.id, gameName: game.name, schema },
        }),
      );
    },
    [dispatch, game],
  );

  const helpers = game?.helpers ?? [];

  const handleRunHelper = () => {
    const runHelper = (helperId: string) =>
      void navigate(
        `/collection/helpers/${helperId}?gameId=${encodeURIComponent(gameId)}`,
      );

    if (helpers.length === 1) {
      runHelper(helpers[0].id);
      return;
    }

    dispatch(
      openOptionsFrame({
        params: {
          title: "Choose a helper",
          dataType: GameDataType.HELPER,
          strategy: selectionStrategyChooseOne(),
          options: helpers.map(helper => ({
            value: helper.id,
            label: helper.name,
          })),
        },
        callbackEmitter: result => {
          const chosenId =
            resultMapper.toChoiceMade(result).payload.chosen[0]?.value;
          if (typeof chosenId === "string") {
            runHelper(chosenId);
          }
        },
      }),
    );
  };

  const handleEnterScores = () => {
    if (!game || scoringSchemas.length === 0) {
      return;
    }

    if (scoringSchemas.length === 1) {
      openScoreEntry(scoringSchemas[0]);
      return;
    }

    dispatch(
      openOptionsFrame({
        params: {
          title: "Choose a scoring schema",
          dataType: GameDataType.SCORING_SCHEMA,
          strategy: selectionStrategyChooseOne(),
          options: scoringSchemas.map(schema => ({
            value: schema.id,
            label: schema.name,
          })),
        },
        callbackEmitter: result => {
          const chosenId =
            resultMapper.toChoiceMade(result).payload.chosen[0]?.value;
          const chosen = scoringSchemas.find(schema => schema.id === chosenId);
          if (chosen) {
            openScoreEntry(chosen);
          }
        },
      }),
    );
  };

  const closeOrNavigate = useCallback(() => {
    if (openedAsFrame) {
      dispatch(closeFrame({ id: frameId }));
      return;
    }

    // The list pagination rides in history state so it stays out of the detail URL.
    void navigate({ pathname: "/collection/games", search: listSearch });
  }, [dispatch, frameId, listSearch, navigate, openedAsFrame]);

  const handleEdit = () => {
    if (!game || !canEditOrDelete) {
      return;
    }

    dispatch(openFormFrame({ params: buildEditGameScreen(game) }));
  };

  const handleOpenDeleteDialog = () => {
    if (!game || !canEditOrDelete) {
      return;
    }

    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    if (isDeleteSubmitting) {
      return;
    }

    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!game) {
      return;
    }

    setIsDeleteSubmitting(true);
    setError(undefined);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL as string}/game-api/games/${game.id}`,
        {
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : undefined,
        },
      );
      setIsDeleteDialogOpen(false);
      closeOrNavigate();
    } catch {
      setError("Unable to delete item");
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const gameBadges = useMemo<GameBadgeProps[]>(
    () =>
      game
        ? [
            {
              type: BadgeTypeEnum.GAME_LENGTH,
              value: game.length,
            },
            {
              type: BadgeTypeEnum.PLAYER_COUNT,
              value: `${game.minPlayers.toString()} - ${game.maxPlayers.toString()}`,
            },
            ...game.tags.map(tag => ({
              type: BadgeTypeEnum.TAG,
              value: tag.name,
              tooltip: tag.description,
              to: `/collection/tags/${tag.id}`,
            })),
          ]
        : [],
    [game],
  );
  const ready = !loading && !error && game;

  return (
    <Paper className="entity-panel-shell" elevation={5}>
      <Box className="entity-panel-header">
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h2" variant="h5">
            {ready ? game.name : "Game details"}
          </Typography>
          {ready && (
            <Typography color="text.secondary" variant="body2">
              {game.description}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Button
            variant="outlined"
            color="inherit"
            type="button"
            startIcon={<ScoreboardIcon />}
            onClick={handleEnterScores}
            disabled={!ready || scoringSchemas.length === 0}
          >
            Enter scores
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            type="button"
            startIcon={<CasinoIcon />}
            onClick={handleRunHelper}
            disabled={!ready || helpers.length === 0}
          >
            Run helper
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            type="button"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            disabled={!ready || !canEditOrDelete}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            type="button"
            startIcon={<DeleteIcon />}
            onClick={handleOpenDeleteDialog}
            disabled={!ready || !canEditOrDelete}
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            type="button"
            startIcon={<CloseIcon />}
            onClick={closeOrNavigate}
          >
            Close
          </Button>
        </Stack>
      </Box>
      <Box className="entity-panel-content">
        {dataViewError.map(message => (
          <Alert key={message} severity="error">
            {message}
          </Alert>
        ))}
        {loading && <Typography>Loading game details...</Typography>}
        {!loading && error && <Alert severity="error">{error}</Alert>}
        {ready && (
          <Stack spacing={1.5}>
            <Box className="entity-panel-badges">
              {gameBadges.map((badge, index) => (
                <GameBadge
                  {...badge}
                  key={`${badge.type}-${badge.value}-${index.toString()}`}
                />
              ))}
            </Box>
            <Stack spacing={1}>
              {helpers.map(helper => (
                <Paper key={helper.id} elevation={1} sx={{ p: 1.5 }}>
                  <Typography>{helper.name}</Typography>
                  {canViewData && (
                    <Button
                      onClick={() =>
                        dispatch(
                          openFormFrame({
                            params: {
                              ...buildEditHelperScreen(helper),
                              title: `View ${helper.name}`,
                              readOnly: true,
                            },
                          }),
                        )
                      }
                    >
                      View helper definition
                    </Button>
                  )}
                  {Object.entries(helper.logic.sets).map(([alias, id]) =>
                    canViewData ? (
                      <Button
                        key={alias}
                        disabled={Boolean(loadingSetId)}
                        onClick={() => void viewSet(id)}
                      >
                        View data set {alias}
                      </Button>
                    ) : (
                      <Typography key={alias} variant="body2">
                        Data set: {alias}
                      </Typography>
                    ),
                  )}
                </Paper>
              ))}
              {game.locations.map(location => {
                const locationName =
                  location.path[location.path.length - 1]?.name ??
                  location.locationId;
                const locationTitle =
                  typeof location.note === "string" && location.note.length > 0
                    ? `${locationName} (${location.note})`
                    : locationName;
                const locationPath = location.path
                  .slice(0, -1)
                  .map(pathPart => pathPart.name)
                  .join(" » ");
                // A game can be used as a location, in which case the id points at a game.
                const locationTarget = location.isGameId
                  ? `/collection/games/${location.locationId}`
                  : `/collection/locations/${location.locationId}`;

                return (
                  <Paper
                    key={location.locationId}
                    component={Link}
                    to={locationTarget}
                    elevation={1}
                    sx={{
                      p: 1.5,
                      display: "block",
                      color: "inherit",
                      textDecoration: "none",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center" }}
                    >
                      {location.isGameId ? (
                        <CasinoIcon color="action" sx={{ mt: 0.25 }} />
                      ) : (
                        <LocationOnIcon color="action" sx={{ mt: 0.25 }} />
                      )}
                      <Box sx={{ minWidth: 0, paddingTop: "3px" }}>
                        <Typography component="p" variant="subtitle2">
                          {locationTitle}
                        </Typography>
                        {locationPath.length > 0 && (
                          <Typography
                            color="text.secondary"
                            component="p"
                            variant="body2"
                          >
                            {locationPath}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
            {pastScores.length > 0 && (
              <Stack spacing={1}>
                <Typography component="h3" variant="subtitle1">
                  Past scores
                </Typography>
                {pastScores.map(score => {
                  const definition = score.schema;
                  // Recomputed on read so schema edits are always reflected.
                  const totals = definition
                    ? score.scores.players.map(player => ({
                        player,
                        total: grandTotal(
                          definition,
                          score.scores.values,
                          player,
                        ),
                      }))
                    : [];

                  return (
                    <Paper key={score.id} elevation={1} sx={{ p: 1.5 }}>
                      <Typography component="p" variant="subtitle2">
                        {`${new Date(score.playedOn).toLocaleDateString()} - ${score.schemaName ?? "Unknown schema"}`}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        component="p"
                        variant="body2"
                      >
                        {totals
                          .map(
                            ({ player, total }) =>
                              `${player}: ${total.toString()}`,
                          )
                          .join("   ")}
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Stack>
        )}
      </Box>
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="game-details-delete-title"
      >
        <DialogTitle id="game-details-delete-title">Delete item</DialogTitle>
        <DialogContent
          sx={{ px: "calc(24px + 10px)", pt: "calc(20px + 10px)" }}
        >
          <DialogContentText>
            Are you sure you want to delete{" "}
            {game ? `"${game.name}"` : "this item"}?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: "calc(16px + 10px)", pb: "calc(8px + 10px)" }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleCloseDeleteDialog}
            disabled={isDeleteSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleConfirmDelete()}
            disabled={isDeleteSubmitting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
