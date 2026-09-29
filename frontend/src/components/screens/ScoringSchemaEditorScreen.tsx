import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    Alert,
    Box,
    Divider,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import axios from "axios";
import type { FC } from "react";
import { useState } from "react";

import type {
    ScoringCategory,
    ScoringGroup,
    ScoringRow,
    ScoringSchemaDefinition,
} from "../../dto/scoring-schema.dto";
import {
    SCORING_GROUP_MECHANISM_LABELS,
    ScoringGroupMechanism,
} from "../../dto/scoring-schema.dto";
import { selectAccessToken } from "../../store/features/currentUserSlice";
import { closeFrame } from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { SCORING_ICONS } from "../../utils/scoring-icons";
import { MainActions } from "../MainActions";
import {
    emptyCategory,
    emptyGroup,
    emptyRow,
    emptySchema,
    moveItem,
    normalizeSchema,
    validateSchemaDraft,
} from "./scoring-schema-draft";
import type { ScoringSchemaEditorScreenPropsFull } from "./ScoringSchemaEditorScreenProps";

const MoveControls: FC<{
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  removeDisabled?: boolean;
  removeLabel: string;
}> = ({ onUp, onDown, onRemove, removeDisabled, removeLabel }) => (
  <Stack direction="row" spacing={0.5}>
    <IconButton aria-label="Move up" size="small" onClick={onUp}>
      <ArrowUpwardIcon fontSize="inherit" />
    </IconButton>
    <IconButton aria-label="Move down" size="small" onClick={onDown}>
      <ArrowDownwardIcon fontSize="inherit" />
    </IconButton>
    <Tooltip title={removeLabel}>
      <span>
        <IconButton
          aria-label={removeLabel}
          size="small"
          color="error"
          disabled={removeDisabled}
          onClick={onRemove}
        >
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </span>
    </Tooltip>
  </Stack>
);

export const ScoringSchemaEditorScreen: FC<
  ScoringSchemaEditorScreenPropsFull
> = ({ frameId, schema: existing }: ScoringSchemaEditorScreenPropsFull) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [schema, setSchema] = useState<ScoringSchemaDefinition>(
    existing?.schema ?? emptySchema(),
  );
  const [showErrors, setShowErrors] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = validateSchemaDraft(name, schema);

  const updateGroups = (
    updater: (groups: ScoringGroup[]) => ScoringGroup[],
  ) => {
    setSchema(current => ({ ...current, groups: updater(current.groups) }));
  };

  const updateGroup = (
    groupIndex: number,
    updater: (group: ScoringGroup) => ScoringGroup,
  ) => {
    updateGroups(groups =>
      groups.map((group, index) =>
        index === groupIndex ? updater(group) : group,
      ),
    );
  };

  const updateCategory = (
    groupIndex: number,
    categoryIndex: number,
    updater: (category: ScoringCategory) => ScoringCategory,
  ) => {
    updateGroup(groupIndex, group => ({
      ...group,
      categories: group.categories.map((category, index) =>
        index === categoryIndex ? updater(category) : category,
      ),
    }));
  };

  const updateRow = (
    groupIndex: number,
    categoryIndex: number,
    rowIndex: number,
    updater: (row: ScoringRow) => ScoringRow,
  ) => {
    updateCategory(groupIndex, categoryIndex, category => ({
      ...category,
      rows: category.rows.map((row, index) =>
        index === rowIndex ? updater(row) : row,
      ),
    }));
  };

  const handleSubmit = async () => {
    if (errors.length > 0) {
      setShowErrors(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(undefined);
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      schema: normalizeSchema(schema),
    };

    try {
      const baseUrl = `${import.meta.env.VITE_API_URL as string}/game-api/scoring-schemas`;
      await axios({
        method: existing ? "PATCH" : "POST",
        url: existing ? `${baseUrl}/${existing.id}` : baseUrl,
        data: payload,
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      });
      dispatch(closeFrame({ id: frameId }));
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to save the schema",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-screen">
      <section
        aria-label="scoring schema editor"
        className="form-screen-section"
      >
        <Paper className="form-screen-card" elevation={8}>
          <Stack spacing={2.5}>
            <Typography component="h2" variant="h5">
              {existing ? `Edit ${existing.name}` : "New scoring schema"}
            </Typography>

            <TextField
              label="Schema name"
              required
              value={name}
              error={showErrors && !name.trim()}
              onChange={event => {
                setName(event.target.value);
              }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={event => {
                setDescription(event.target.value);
              }}
            />

            {schema.groups.map((group, groupIndex) => (
              <Paper key={group.id} variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center" }}
                  >
                    <TextField
                      label="Group name"
                      size="small"
                      sx={{ flex: 1 }}
                      value={group.name ?? ""}
                      onChange={event => {
                        updateGroup(groupIndex, current => ({
                          ...current,
                          name: event.target.value,
                        }));
                      }}
                    />
                    <TextField
                      select
                      label="Scoring"
                      size="small"
                      sx={{ minWidth: 220 }}
                      value={group.mechanism}
                      onChange={event => {
                        updateGroup(groupIndex, current => ({
                          ...current,
                          mechanism: event.target
                            .value as ScoringGroupMechanism,
                        }));
                      }}
                    >
                      {Object.values(ScoringGroupMechanism).map(mechanism => (
                        <MenuItem key={mechanism} value={mechanism}>
                          {SCORING_GROUP_MECHANISM_LABELS[mechanism]}
                        </MenuItem>
                      ))}
                    </TextField>
                    <MoveControls
                      removeLabel="Remove group"
                      removeDisabled={schema.groups.length < 2}
                      onUp={() => {
                        updateGroups(groups =>
                          moveItem(groups, groupIndex, groupIndex - 1),
                        );
                      }}
                      onDown={() => {
                        updateGroups(groups =>
                          moveItem(groups, groupIndex, groupIndex + 1),
                        );
                      }}
                      onRemove={() => {
                        updateGroups(groups =>
                          groups.filter((_, index) => index !== groupIndex),
                        );
                      }}
                    />
                  </Stack>

                  {group.categories.map((category, categoryIndex) => (
                    <Box key={category.id} sx={{ pl: 2 }}>
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "center" }}
                        >
                          <TextField
                            label="Category name"
                            size="small"
                            sx={{ flex: 1 }}
                            value={category.name ?? ""}
                            onChange={event => {
                              updateCategory(
                                groupIndex,
                                categoryIndex,
                                current => ({
                                  ...current,
                                  name: event.target.value,
                                }),
                              );
                            }}
                          />
                          <MoveControls
                            removeLabel="Remove category"
                            removeDisabled={group.categories.length < 2}
                            onUp={() => {
                              updateGroup(groupIndex, current => ({
                                ...current,
                                categories: moveItem(
                                  current.categories,
                                  categoryIndex,
                                  categoryIndex - 1,
                                ),
                              }));
                            }}
                            onDown={() => {
                              updateGroup(groupIndex, current => ({
                                ...current,
                                categories: moveItem(
                                  current.categories,
                                  categoryIndex,
                                  categoryIndex + 1,
                                ),
                              }));
                            }}
                            onRemove={() => {
                              updateGroup(groupIndex, current => ({
                                ...current,
                                categories: current.categories.filter(
                                  (_, index) => index !== categoryIndex,
                                ),
                              }));
                            }}
                          />
                        </Stack>

                        {category.rows.map((row, rowIndex) => (
                          <Stack
                            key={row.id}
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center", pl: 2 }}
                          >
                            <TextField
                              label="Row name"
                              size="small"
                              sx={{ flex: 1 }}
                              value={row.name ?? ""}
                              error={
                                showErrors && !row.name?.trim() && !row.icon
                              }
                              helperText={
                                showErrors && !row.name?.trim() && !row.icon
                                  ? "Name is required when no icon is chosen"
                                  : undefined
                              }
                              onChange={event => {
                                updateRow(
                                  groupIndex,
                                  categoryIndex,
                                  rowIndex,
                                  current => ({
                                    ...current,
                                    name: event.target.value,
                                  }),
                                );
                              }}
                            />
                            <TextField
                              select
                              label="Icon"
                              size="small"
                              sx={{ minWidth: 160 }}
                              value={row.icon ?? ""}
                              onChange={event => {
                                updateRow(
                                  groupIndex,
                                  categoryIndex,
                                  rowIndex,
                                  current => ({
                                    ...current,
                                    icon: event.target.value || undefined,
                                  }),
                                );
                              }}
                            >
                              <MenuItem value="">None</MenuItem>
                              {SCORING_ICONS.map(({ id, label, Icon }) => (
                                <MenuItem key={id} value={id}>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ alignItems: "center" }}
                                  >
                                    <Icon fontSize="small" />
                                    <span>{label}</span>
                                  </Stack>
                                </MenuItem>
                              ))}
                            </TextField>
                            <MoveControls
                              removeLabel="Remove row"
                              removeDisabled={category.rows.length < 2}
                              onUp={() => {
                                updateCategory(
                                  groupIndex,
                                  categoryIndex,
                                  current => ({
                                    ...current,
                                    rows: moveItem(
                                      current.rows,
                                      rowIndex,
                                      rowIndex - 1,
                                    ),
                                  }),
                                );
                              }}
                              onDown={() => {
                                updateCategory(
                                  groupIndex,
                                  categoryIndex,
                                  current => ({
                                    ...current,
                                    rows: moveItem(
                                      current.rows,
                                      rowIndex,
                                      rowIndex + 1,
                                    ),
                                  }),
                                );
                              }}
                              onRemove={() => {
                                updateCategory(
                                  groupIndex,
                                  categoryIndex,
                                  current => ({
                                    ...current,
                                    rows: current.rows.filter(
                                      (_, index) => index !== rowIndex,
                                    ),
                                  }),
                                );
                              }}
                            />
                          </Stack>
                        ))}

                        <Box sx={{ pl: 2 }}>
                          <IconButton
                            aria-label="Add row"
                            size="small"
                            onClick={() => {
                              updateCategory(
                                groupIndex,
                                categoryIndex,
                                current => ({
                                  ...current,
                                  rows: [...current.rows, emptyRow()],
                                }),
                              );
                            }}
                          >
                            <AddIcon fontSize="inherit" />
                          </IconButton>
                        </Box>
                        <Divider />
                      </Stack>
                    </Box>
                  ))}

                  <Box sx={{ pl: 2 }}>
                    <IconButton
                      aria-label="Add category"
                      size="small"
                      onClick={() => {
                        updateGroup(groupIndex, current => ({
                          ...current,
                          categories: [...current.categories, emptyCategory()],
                        }));
                      }}
                    >
                      <AddIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </Stack>
              </Paper>
            ))}

            <Box>
              <IconButton
                aria-label="Add group"
                onClick={() => {
                  updateGroups(groups => [...groups, emptyGroup()]);
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>

            {showErrors &&
              errors.map(error => (
                <Alert key={error} severity="error">
                  {error}
                </Alert>
              ))}
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <MainActions
              frameId={frameId}
              confirmEnabled={!isSubmitting}
              errorCount={showErrors ? errors.length : 0}
              onShowErrors={() => {
                setShowErrors(true);
              }}
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
