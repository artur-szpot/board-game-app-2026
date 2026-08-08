import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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

import type { LocationResponseDto } from "../../dto/collection-items.dto";
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
import { buildEditLocationScreen } from "./definitions/edit-location";
import type { LocationDetailsScreenPropsFull } from "./LocationDetailsScreenProps";

export const LocationDetailsScreen = ({
  locationId,
  openedAsFrame,
  frameId,
}: LocationDetailsScreenPropsFull) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const accessToken = useAppSelector(selectAccessToken);
  const permissions = useAppSelector(selectPermissions);
  const userId = useAppSelector(selectUserId);
  const [location, setLocation] = useState<LocationResponseDto | undefined>();
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
    if (!location) {
      return false;
    }

    const record = location as LocationResponseDto & {
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
  }, [hasSystemCollectionFullPermission, location, userId]);

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

  const closeOrNavigate = useCallback(() => {
    if (openedAsFrame) {
      dispatch(closeFrame({ id: frameId }));
      return;
    }

    void navigate("/collection/locations");
  }, [dispatch, frameId, navigate, openedAsFrame]);

  const handleEdit = () => {
    if (!location || !canEditOrDelete) {
      return;
    }

    dispatch(openFormFrame({ params: buildEditLocationScreen(location) }));
  };

  const handleOpenDeleteDialog = () => {
    if (!location || !canEditOrDelete) {
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
    if (!location) {
      return;
    }

    setIsDeleteSubmitting(true);
    setError(undefined);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL as string}/game-api/locations/${location.id}`,
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
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="location-details-delete-title"
      >
        <DialogTitle id="location-details-delete-title">
          Delete item
        </DialogTitle>
        <DialogContent
          sx={{ px: "calc(24px + 10px)", pt: "calc(20px + 10px)" }}
        >
          <DialogContentText>
            Are you sure you want to delete{" "}
            {location ? `"${location.name}"` : "this item"}?
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
