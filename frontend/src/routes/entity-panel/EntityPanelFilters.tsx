import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
    Badge,
    Box,
    Button,
    Chip,
    Collapse,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import { selectionStrategySelectAnyNumber } from "../../components/screens/selection-strategies";
import { selectAccessToken } from "../../store/features/currentUserSlice";
import { resultMapper } from "../../store/features/frame-actions";
import { openSearchFrame } from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

import type {
    EntityPanelEntitySelectionFilter,
    EntityPanelFilterDefinition,
} from "./entity-panel-types";
import { EntityPanelFilterKind } from "./entity-panel-types";
import type { EntityPanelFilterValues } from "./filter-params";
import { parseIdList } from "./filter-params";

type EntityPanelFiltersProps = {
  definitions: EntityPanelFilterDefinition[];
  values: EntityPanelFilterValues;
  onChange: (patch: EntityPanelFilterValues) => void;
  onClear: () => void;
};

const ANY_OPTION_VALUE = "";

export const EntityPanelFilters = ({
  definitions,
  values,
  onChange,
  onClear,
}: EntityPanelFiltersProps) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const [isOpen, setIsOpen] = useState(false);
  const [names, setNames] = useState<Record<string, string>>({});

  const activeCount = definitions.filter(
    definition => (values[definition.key] ?? "").length > 0,
  ).length;

  const rememberNames = useCallback((entries: Record<string, string>) => {
    setNames(current => ({ ...current, ...entries }));
  }, []);

  // Ids restored from the URL carry no names, so they are resolved once per id.
  useEffect(() => {
    const pending = definitions.flatMap(definition =>
      definition.kind === EntityPanelFilterKind.ENTITY_SELECTION
        ? parseIdList(values[definition.key] ?? "").map(id => ({
            id,
            endpoint: definition.detailEndpoint,
          }))
        : [],
    );

    const missing = pending.filter(entry => !(entry.id in names));
    if (missing.length === 0 || !accessToken) {
      return;
    }

    let isActive = true;
    const resolve = async () => {
      const resolved = await Promise.all(
        missing.map(async entry => {
          try {
            const response = await axios.get<{ name?: string }>(
              `${import.meta.env.VITE_API_URL as string}/${entry.endpoint}/${entry.id}`,
              { headers: { Authorization: `Bearer ${accessToken}` } },
            );
            return [entry.id, response.data.name ?? entry.id] as const;
          } catch {
            return [entry.id, entry.id] as const;
          }
        }),
      );

      if (isActive) {
        rememberNames(Object.fromEntries(resolved));
      }
    };

    void resolve();

    return () => {
      isActive = false;
    };
  }, [accessToken, definitions, names, rememberNames, values]);

  const onOpenSelection = (definition: EntityPanelEntitySelectionFilter) => {
    const selectedIds = parseIdList(values[definition.key] ?? "");

    dispatch(
      openSearchFrame({
        params: {
          title: definition.label,
          strategy: selectionStrategySelectAnyNumber(),
          dataTypes: definition.dataTypes,
          currentSelection: selectedIds.map(id => ({
            type: definition.dataTypes[0],
            value: id,
            name: names[id] ?? id,
          })),
        },
        callbackEmitter: result => {
          const { chosen } = resultMapper.toChoiceMade(result).payload;
          rememberNames(
            Object.fromEntries(chosen.map(item => [item.value, item.name])),
          );
          onChange({
            [definition.key]: chosen.map(item => item.value).join(","),
          });
        },
      }),
    );
  };

  const onRemoveId = (definition: EntityPanelFilterDefinition, id: string) => {
    const remaining = parseIdList(values[definition.key] ?? "").filter(
      current => current !== id,
    );
    onChange({ [definition.key]: remaining.join(",") });
  };

  const renderFilter = (definition: EntityPanelFilterDefinition) => {
    const value = values[definition.key] ?? "";

    switch (definition.kind) {
      case EntityPanelFilterKind.NUMBER:
        return (
          <TextField
            key={definition.key}
            className="entity-panel-filter-field"
            size="small"
            id={`filter-${definition.key}-input`}
            label={definition.label}
            value={value}
            onChange={event =>
              onChange({ [definition.key]: event.target.value })
            }
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
          />
        );
      case EntityPanelFilterKind.SELECT:
        return (
          <TextField
            key={definition.key}
            className="entity-panel-filter-field"
            size="small"
            select
            id={`filter-${definition.key}-input`}
            label={definition.label}
            value={value}
            onChange={event =>
              onChange({ [definition.key]: event.target.value })
            }
          >
            <MenuItem value={ANY_OPTION_VALUE}>Any</MenuItem>
            {definition.options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );
      case EntityPanelFilterKind.TRI_STATE:
        return (
          <TextField
            key={definition.key}
            className="entity-panel-filter-field"
            size="small"
            select
            id={`filter-${definition.key}-input`}
            label={definition.label}
            value={value}
            onChange={event =>
              onChange({ [definition.key]: event.target.value })
            }
          >
            <MenuItem value={ANY_OPTION_VALUE}>Any</MenuItem>
            <MenuItem value="true">{definition.trueLabel}</MenuItem>
            <MenuItem value="false">{definition.falseLabel}</MenuItem>
          </TextField>
        );
      case EntityPanelFilterKind.ENTITY_SELECTION: {
        const selectedIds = parseIdList(value);
        return (
          <Box key={definition.key} className="entity-panel-filter-selection">
            <Typography variant="body2">{definition.label}</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {selectedIds.map(id => (
                <Chip
                  key={id}
                  size="small"
                  label={names[id] ?? id}
                  onDelete={() => onRemoveId(definition, id)}
                />
              ))}
              <Button
                size="small"
                variant="outlined"
                type="button"
                onClick={() => onOpenSelection(definition)}
              >
                {selectedIds.length > 0 ? "Change" : "Choose"}
              </Button>
            </Stack>
          </Box>
        );
      }
    }
  };

  return (
    <Box className="entity-panel-filters">
      <Box className="entity-panel-filters-controls">
        <Badge badgeContent={activeCount} color="primary">
          <Button
            variant="outlined"
            type="button"
            startIcon={<FilterListIcon />}
            onClick={() => setIsOpen(current => !current)}
            aria-expanded={isOpen}
          >
            Filters
          </Button>
        </Badge>
        {activeCount > 0 && (
          <Button
            variant="text"
            color="inherit"
            type="button"
            startIcon={<ClearIcon />}
            onClick={onClear}
          >
            Clear filters
          </Button>
        )}
      </Box>
      <Collapse in={isOpen} unmountOnExit>
        <Box className="entity-panel-filter-fields">
          {definitions.map(renderFilter)}
        </Box>
      </Collapse>
    </Box>
  );
};
