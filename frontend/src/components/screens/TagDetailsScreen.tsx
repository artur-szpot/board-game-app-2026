import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PublicIcon from "@mui/icons-material/Public";
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

import type { TagResponseDto } from "../../dto/collection-items.dto";
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
import { buildEditTagScreen } from "./definitions/edit-tag";
import type { TagDetailsScreenPropsFull } from "./TagDetailsScreenProps";

export const TagDetailsScreen = ({
  tagId,
  openedAsFrame,
  frameId,
}: TagDetailsScreenPropsFull) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const accessToken = useAppSelector(selectAccessToken);
  const permissions = useAppSelector(selectPermissions);
  const userId = useAppSelector(selectUserId);
  const [tag, setTag] = useState<TagResponseDto | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [isMakePublicDialogOpen, setIsMakePublicDialogOpen] = useState(false);
  const [isMakePublicSubmitting, setIsMakePublicSubmitting] = useState(false);

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
    if (!tag) {
      return false;
    }

    const record = tag as TagResponseDto & {
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
  }, [hasSystemCollectionFullPermission, tag, userId]);

  const loadTag = useCallback(async () => {
    if (!tagId) {
      setTag(undefined);
      setError("Missing tag id");
      return;
    }

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
  }, [accessToken, tagId]);

  useEffect(() => {
    void loadTag();
  }, [loadTag]);

  const closeOrNavigate = useCallback(() => {
    if (openedAsFrame) {
      dispatch(closeFrame({ id: frameId }));
      return;
    }

    void navigate("/collection/tags");
  }, [dispatch, frameId, navigate, openedAsFrame]);

  const handleEdit = () => {
    if (!tag || !canEditOrDelete) {
      return;
    }

    dispatch(openFormFrame({ params: buildEditTagScreen(tag) }));
  };

  const handleOpenDeleteDialog = () => {
    if (!tag || !canEditOrDelete) {
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
    if (!tag) {
      return;
    }

    setIsDeleteSubmitting(true);
    setError(undefined);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL as string}/game-api/tags/${tag.id}`,
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

  const canShowMakePublicButton = useMemo(() => {
    if (!tag || !hasSystemCollectionFullPermission) {
      return false;
    }

    return tag.ownerId !== "SYSTEM";
  }, [hasSystemCollectionFullPermission, tag]);

  const handleOpenMakePublicDialog = () => {
    if (!canShowMakePublicButton) {
      return;
    }

    setIsMakePublicDialogOpen(true);
  };

  const handleCloseMakePublicDialog = () => {
    if (isMakePublicSubmitting) {
      return;
    }

    setIsMakePublicDialogOpen(false);
  };

  const handleConfirmMakePublic = async () => {
    if (!tag) {
      return;
    }

    setIsMakePublicSubmitting(true);
    setError(undefined);
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL as string}/game-api/tags/${tag.id}/system`,
        {},
        {
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : undefined,
        },
      );
      setIsMakePublicDialogOpen(false);
      await loadTag();
    } catch {
      setError("Unable to make tag public");
    } finally {
      setIsMakePublicSubmitting(false);
    }
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
          {canShowMakePublicButton && (
            <Button
              variant="outlined"
              color="inherit"
              type="button"
              startIcon={<PublicIcon />}
              onClick={handleOpenMakePublicDialog}
              disabled={!ready || isMakePublicSubmitting}
            >
              Make public
            </Button>
          )}
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
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="tag-details-delete-title"
      >
        <DialogTitle id="tag-details-delete-title">Delete item</DialogTitle>
        <DialogContent
          sx={{ px: "calc(24px + 10px)", pt: "calc(20px + 10px)" }}
        >
          <DialogContentText>
            Are you sure you want to delete{" "}
            {tag ? `"${tag.name}"` : "this item"}?
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
      <Dialog
        open={isMakePublicDialogOpen}
        onClose={handleCloseMakePublicDialog}
        aria-labelledby="tag-details-make-public-title"
      >
        <DialogTitle id="tag-details-make-public-title">
          Make tag public
        </DialogTitle>
        <DialogContent
          sx={{ px: "calc(24px + 10px)", pt: "calc(20px + 10px)" }}
        >
          <DialogContentText>
            Are you sure you want to make {tag ? `"${tag.name}"` : "this tag"}{" "}
            public and transfer ownership to SYSTEM?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: "calc(16px + 10px)", pb: "calc(8px + 10px)" }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleCloseMakePublicDialog}
            disabled={isMakePublicSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => void handleConfirmMakePublic()}
            disabled={isMakePublicSubmitting}
          >
            Make public
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
