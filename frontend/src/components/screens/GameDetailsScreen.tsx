import CasinoIcon from "@mui/icons-material/Casino";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

import type { GameResponseDto } from "../../dto/collection-items.dto";
import { selectAccessToken } from "../../store/features/currentUserSlice";
import { closeFrame } from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { GameBadgeProps } from "./GameBadge";
import { BadgeTypeEnum, GameBadge } from "./GameBadge";
import type { GameDetailsScreenPropsFull } from "./GameDetailsScreenProps";

export const GameDetailsScreen = ({
  gameId,
  openedAsFrame,
  frameId,
}: GameDetailsScreenPropsFull) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const [game, setGame] = useState<GameResponseDto | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

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

  const handleCloseFrame = () => {
    if (!openedAsFrame) {
      return;
    }
    const payload: { id: string } = { id: frameId };
    dispatch(closeFrame(payload));
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
        {openedAsFrame && (
          <Button
            variant="outlined"
            color="inherit"
            type="button"
            onClick={handleCloseFrame}
          >
            Close
          </Button>
        )}
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
    </Paper>
  );
};
