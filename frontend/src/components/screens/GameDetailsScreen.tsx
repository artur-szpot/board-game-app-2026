import CasinoIcon from "@mui/icons-material/Casino";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LocationOnIcon from "@mui/icons-material/LocationOn";
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
import { useNavigate } from "react-router";

import type { GameResponseDto } from "../../dto/collection-items.dto";
import {
    selectAccessToken,
    selectPermissions,
    selectUserId,
} from "../../store/features/currentUserSlice";
import {
    closeFrame,
    openFormFrame,
} from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { buildEditGameScreen } from "./definitions/edit-game";
import type { GameBadgeProps } from "./GameBadge";
import { BadgeTypeEnum, GameBadge } from "./GameBadge";
import type { GameDetailsScreenPropsFull } from "./GameDetailsScreenProps";

export const GameDetailsScreen = ({
  gameId,
  openedAsFrame,
  frameId,
}: GameDetailsScreenPropsFull) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const accessToken = useAppSelector(selectAccessToken);
  const permissions = useAppSelector(selectPermissions);
  const userId = useAppSelector(selectUserId);
  const [game, setGame] = useState<GameResponseDto | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  const hasSystemCollectionFullPermission = useMemo(
    () =>
      (permissions ?? []).some(
        permission =>
          permission.permissionType === "SYSTEM_COLLECTION" &&
          permission.permissionLevel === "FULL",
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

  const closeOrNavigate = useCallback(() => {
    if (openedAsFrame) {
      dispatch(closeFrame({ id: frameId }));
      return;
    }

    void navigate("/collection/games");
  }, [dispatch, frameId, navigate, openedAsFrame]);

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
              value: `${game.minPlayers.toString()}-${game.maxPlayers.toString()}`,
            },
            ...game.tags.map(tag => ({
              key: `tag-${tag.id}`,
              type: BadgeTypeEnum.TAG,
              value: tag.name,
              tooltip: tag.description,
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
        {loading && <Typography>Loading game details...</Typography>}
        {!loading && error && <Alert severity="error">{error}</Alert>}
        {ready && (
          <Stack spacing={1.5}>
            <Box className="entity-panel-badges">
              {gameBadges.map((badge, index) => (
                <GameBadge
                  key={`${badge.type}-${badge.value}-${index.toString()}`}
                  {...badge}
                />
              ))}
            </Box>
            <Stack spacing={1}>
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

                return (
                  <Paper
                    key={location.locationId}
                    elevation={1}
                    sx={{ p: 1.5 }}
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
