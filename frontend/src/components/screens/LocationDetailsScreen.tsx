import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

import type { LocationResponseDto } from "../../dto/collection-items.dto";
import { selectAccessToken } from "../../store/features/currentUserSlice";
import { closeFrame } from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { LocationDetailsScreenPropsFull } from "./LocationDetailsScreenProps";

export const LocationDetailsScreen = ({
  locationId,
  openedAsFrame,
  frameId,
}: LocationDetailsScreenPropsFull) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const [location, setLocation] = useState<LocationResponseDto | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!locationId) {
      setLocation(undefined);
      setError("Missing location id");
      return;
    }

    const loadLocation = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const response = await axios.get<LocationResponseDto>(
          `${import.meta.env.VITE_API_URL as string}/game-api/locations/${locationId}`,
          {
            headers: accessToken
              ? {
                  Authorization: `Bearer ${accessToken}`,
                }
              : undefined,
          },
        );

        setLocation(response.data);
      } catch {
        setLocation(undefined);
        setError("Unable to load location details");
      } finally {
        setLoading(false);
      }
    };

    void loadLocation();
  }, [accessToken, locationId]);

  const handleCloseFrame = () => {
    if (!openedAsFrame) {
      return;
    }

    dispatch(closeFrame({ id: frameId }));
  };

  const locationPath = useMemo(
    () =>
      location?.path
        .slice(0, -1)
        .map(pathPart => pathPart.name)
        .join(" » ") ?? "",
    [location],
  );

  const ready = !loading && !error && location;

  return (
    <Paper className="entity-panel-shell" elevation={5}>
      <Box className="entity-panel-header">
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h2" variant="h5">
            {ready ? location.name : "Location details"}
          </Typography>
          {ready && location.description && (
            <Typography color="text.secondary" variant="body2">
              {location.description}
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
        {loading && <Typography>Loading location details...</Typography>}
        {!loading && error && <Alert severity="error">{error}</Alert>}
        {ready && (
          <Stack spacing={1.5}>
            {location.description ? null : (
              <Typography color="text.secondary" variant="body2">
                No description provided.
              </Typography>
            )}
            {locationPath.length > 0 && (
              <Box>
                <Typography component="h3" variant="subtitle2">
                  Path
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {locationPath}
                </Typography>
              </Box>
            )}
            {location.parentId && (
              <Box>
                <Typography component="h3" variant="subtitle2">
                  Parent location
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {location.parentId}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};
