import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";

import { selectAccessToken } from "../../store/features/currentUserSlice";
import { closeFrame } from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { extractApiErrorMessages } from "../../utils/api-error";
import { isSetData, SET_NAMING_HELP } from "../../utils/set-data";
import { MainActions } from "../MainActions";
import type { SetEditorScreenPropsFull } from "./SetEditorScreenProps";
import {
  createSetDraft,
  emptySetItem,
  enteredProperties,
  identifierError,
  removeProperty,
  serializeSetDraft,
  updateProperty,
  validateSetDraft,
} from "./set-draft";

export const SetEditorScreen = ({
  frameId,
  set: existing,
  readOnly = false,
}: SetEditorScreenPropsFull) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const legacy = Boolean(existing && !isSetData(existing.data));
  const [replacing, setReplacing] = useState(false);
  const [name, setName] = useState(existing?.name ?? "");
  const [draft, setDraft] = useState(() =>
    createSetDraft(
      existing && isSetData(existing.data) ? existing.data : undefined,
    ),
  );
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const properties = enteredProperties(draft);
  const errors = validateSetDraft(name, draft);
  const blocked = legacy && !replacing;

  const save = async () => {
    if (readOnly || blocked || isSubmitting) {
      return;
    }
    if (errors.length > 0) {
      setShowErrors(true);
      return;
    }
    setIsSubmitting(true);
    setSubmitErrors([]);
    try {
      const url = `${import.meta.env.VITE_API_URL as string}/game-api/sets`;
      await axios({
        method: existing ? "PUT" : "POST",
        url: existing ? `${url}/${existing.id}` : url,
        data: { name, data: serializeSetDraft(draft) },
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      });
      dispatch(closeFrame({ id: frameId }));
    } catch (error) {
      setSubmitErrors(extractApiErrorMessages(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-screen">
      <section
        aria-label="helper data set editor"
        className="form-screen-section"
      >
        <Paper className="form-screen-card" elevation={8}>
          <Stack spacing={2.5}>
            <Typography component="h2" variant="h5">
              {existing
                ? `${readOnly ? "View" : "Edit"} ${existing.name}`
                : "New helper data set"}
            </Typography>
            {blocked && (
              <Alert
                severity="error"
                action={
                  !readOnly && (
                    <Button onClick={() => setReplacing(true)}>
                      Replace data
                    </Button>
                  )
                }
              >
                This set uses an unsupported data format. Replace its data to
                use this editor. Existing item values will be discarded.
              </Alert>
            )}
            <fieldset
              disabled={blocked || isSubmitting}
              style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
            >
              <Stack spacing={2.5}>
                <TextField
                  label="Data set name"
                  required
                  value={name}
                  slotProps={{ input: { readOnly } }}
                  error={Boolean(
                    (showErrors || name !== "") && identifierError(name),
                  )}
                  helperText={SET_NAMING_HELP}
                  onChange={event => setName(event.target.value)}
                />
                <Typography>
                  Item display names are translated using
                  helper.set.&lt;setName&gt;.&lt;itemName&gt;. Renaming a set or
                  item changes its translation key.
                </Typography>
                <Typography component="h3" variant="h6">
                  Item properties
                </Typography>
                <Typography>At least one property must be set</Typography>
                {(readOnly ? properties : draft.properties).map(
                  (property, index) => {
                    const error = identifierError(
                      property.name,
                      properties.map(row => row.name),
                    );
                    const placeholder =
                      index === draft.properties.length - 1 &&
                      property.name === "";
                    const showPropertyError =
                      !placeholder || (showErrors && properties.length === 0);
                    return (
                      <Stack
                        key={property.id}
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "flex-start" }}
                      >
                        <TextField
                          label={`Property ${(index + 1).toString()}`}
                          value={property.name}
                          slotProps={{ input: { readOnly } }}
                          sx={{ flex: 1 }}
                          error={showPropertyError && Boolean(error)}
                          helperText={
                            showPropertyError && error ? error : SET_NAMING_HELP
                          }
                          onChange={event =>
                            setDraft(current =>
                              updateProperty(
                                current,
                                property.id,
                                event.target.value,
                              ),
                            )
                          }
                        />
                        {!readOnly && (
                          <IconButton
                            aria-label={`Remove property ${(index + 1).toString()}`}
                            color="error"
                            onClick={() =>
                              setDraft(current =>
                                removeProperty(current, property.id),
                              )
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Stack>
                    );
                  },
                )}
                <Typography component="h3" variant="h6">
                  Items
                </Typography>
                {draft.items.map((item, index) => (
                  <Stack
                    key={item.id}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{ flexWrap: "wrap", gap: 1 }}
                  >
                    <TextField
                      label={`Item ${(index + 1).toString()} name`}
                      required
                      value={item.name}
                      slotProps={{ input: { readOnly } }}
                      error={Boolean(
                        (showErrors || item.name !== "") &&
                        identifierError(
                          item.name,
                          draft.items.map(row => row.name),
                        ),
                      )}
                      helperText={
                        identifierError(
                          item.name,
                          draft.items.map(row => row.name),
                        ) &&
                        (showErrors || item.name !== "")
                          ? identifierError(
                              item.name,
                              draft.items.map(row => row.name),
                            )
                          : SET_NAMING_HELP
                      }
                      onChange={event =>
                        setDraft(current => ({
                          ...current,
                          items: current.items.map(row =>
                            row.id === item.id
                              ? { ...row, name: event.target.value }
                              : row,
                          ),
                        }))
                      }
                    />
                    {properties
                      .filter(property => property.name !== "")
                      .map(property => (
                        <TextField
                          key={property.id}
                          label={property.name}
                          value={item.values[property.id] ?? ""}
                          slotProps={{
                            input: { readOnly },
                            htmlInput: {
                              "aria-label": `Item ${(index + 1).toString()} ${property.name}`,
                            },
                          }}
                          onChange={event =>
                            setDraft(current => ({
                              ...current,
                              items: current.items.map(row =>
                                row.id === item.id
                                  ? {
                                      ...row,
                                      values: {
                                        ...row.values,
                                        [property.id]: event.target.value,
                                      },
                                    }
                                  : row,
                              ),
                            }))
                          }
                        />
                      ))}
                    {!readOnly && (
                      <IconButton
                        aria-label={`Remove item ${(index + 1).toString()}`}
                        color="error"
                        onClick={() =>
                          setDraft(current => ({
                            ...current,
                            items:
                              current.items.length === 1
                                ? [emptySetItem()]
                                : current.items.filter(
                                    row => row.id !== item.id,
                                  ),
                          }))
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                {!readOnly && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() =>
                      setDraft(current => ({
                        ...current,
                        items: [...current.items, emptySetItem()],
                      }))
                    }
                  >
                    Add item
                  </Button>
                )}
              </Stack>
            </fieldset>
            {showErrors &&
              errors.map(error => (
                <Alert key={error} severity="error">
                  {error}
                </Alert>
              ))}
            {submitErrors.map((error, index) => (
              <Alert key={index} severity="error">
                {error}
              </Alert>
            ))}
            <fieldset
              disabled={isSubmitting}
              style={{ border: 0, padding: 0, margin: 0 }}
            >
              <MainActions
                allowConfirm={!readOnly}
                frameId={frameId}
                confirmCallback={() => void save()}
                confirmEnabled={!blocked && !isSubmitting}
                errorCount={readOnly ? 0 : errors.length}
                onShowErrors={() => setShowErrors(true)}
              />
            </fieldset>
          </Stack>
        </Paper>
      </section>
    </div>
  );
};
