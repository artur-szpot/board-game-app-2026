import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";

import type { TagResponseDto } from "../../dto/collection-items.dto";
import { selectAccessToken } from "../../store/features/currentUserSlice";
import { closeFrame } from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { TagDetailsScreenPropsFull } from "./TagDetailsScreenProps";

export const TagDetailsScreen = ({
  tagId,
  openedAsFrame,
  frameId,
}: TagDetailsScreenPropsFull) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const [tag, setTag] = useState<TagResponseDto | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!tagId) {
      setTag(undefined);
      setError("Missing tag id");
      return;
    }

    const loadTag = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const response = await axios.get<TagResponseDto>(
          `${import.meta.env.VITE_API_URL as string}/game-api/tags/${tagId}`,
          {
            headers: accessToken
              ? {
                  Authorization: `Bearer ${accessToken}`,
                }
              : undefined,
          },
        );

        setTag(response.data);
      } catch {
        setTag(undefined);
        setError("Unable to load tag details");
      } finally {
        setLoading(false);
      }
    };

    void loadTag();
  }, [accessToken, tagId]);

  const handleCloseFrame = () => {
    if (!openedAsFrame) {
      return;
    }

    dispatch(closeFrame({ id: frameId }));
  };

  const ready = !loading && !error && tag;

  return (
    <Paper className="entity-panel-shell" elevation={5}>
      <Box className="entity-panel-header">
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h2" variant="h5">
            {ready ? tag.name : "Tag details"}
          </Typography>
          {ready && tag.description && (
            <Typography color="text.secondary" variant="body2">
              {tag.description}
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
        {loading && <Typography>Loading tag details...</Typography>}
        {!loading && error && <Alert severity="error">{error}</Alert>}
        {ready && (
          <Stack spacing={1.5}>
            {tag.description ? null : (
              <Typography color="text.secondary" variant="body2">
                No description provided.
              </Typography>
            )}
            {tag.parentId && (
              <Box>
                <Typography component="h3" variant="subtitle2">
                  Parent tag
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {tag.parentId}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};
