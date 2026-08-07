/* eslint-disable no-case-declarations */
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
    Alert,
    Box,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";

import type { GameBadgeProps } from "../../components/screens/GameBadge";
import { BadgeTypeEnum, GameBadge } from "../../components/screens/GameBadge";
import { GameDataType } from "../../components/screens/selection-strategies";
import type { GameResponseDto } from "../../dto/collection-items.dto";
import { AdminDataType } from "../admin-panel/admin-data-type.enum";
import type { EntityPanelTab } from "./entity-panel-types";

type EntityPanelContentProps<Category extends string, Item> = {
  tab?: EntityPanelTab<Category, Item>;
  items: Item[];
  loading: boolean;
  error?: string;
  onViewItem: (item: Item) => void;
  canViewItem: (item: Item) => boolean;
  onEditItem: (item: Item) => void;
  canEditItem: (item: Item) => boolean;
  onDeleteItem: (item: Item) => void;
  canDeleteItem: (item: Item) => boolean;
};

const renderItem = <Item,>(
  item: Item,
  category: string,
  onViewItem: (item: Item) => void,
  canViewItem: (item: Item) => boolean,
  onEditItem: (item: Item) => void,
  canEditItem: (item: Item) => boolean,
  onDeleteItem: (item: Item) => void,
  canDeleteItem: (item: Item) => boolean,
) => {
  const record = (item ?? {}) as Record<string, unknown>;
  let name =
    typeof record.name === "string" && record.name.length > 0
      ? record.name
      : "NO NAME FOUND";
  let description =
    typeof record.description === "string" ? record.description : undefined;
  let locationPath: string | undefined;
  const badges: GameBadgeProps[] = [];

  switch (category) {
    case GameDataType.GAME as string:
      const gameDetail = record as Partial<GameResponseDto>;
      badges.push({
        type: BadgeTypeEnum.GAME_LENGTH,
        value: gameDetail.length ?? "Unknown",
      });
      badges.push({
        type: BadgeTypeEnum.PLAYER_COUNT,
        value: `${(gameDetail.minPlayers ?? 0).toString()}-${(gameDetail.maxPlayers ?? 0).toString()}`,
      });
      (Array.isArray(gameDetail.tags) ? gameDetail.tags : []).forEach(tag => {
        if (typeof tag !== "object") {
          throw new Error("Wrong DTO shape received");
        }

        const tagRecord = tag as { name: string; description?: string };
        badges.push({
          type: BadgeTypeEnum.TAG,
          value: tagRecord.name,
          tooltip: tagRecord.description,
        });
      });
      break;
    case AdminDataType.PERMISSION as string:
      name = record.permissionType as string;
      break;
    case AdminDataType.USER as string:
      name = record.username as string;
      description = record.email as string;
      break;
    case GameDataType.LOCATION as string:
      const pathParts = Array.isArray(record.path)
        ? record.path
            .slice(0, -1)
            .map(pathItem => {
              if (typeof pathItem !== "object" || pathItem === null) {
                return "";
              }

              const pathRecord = pathItem as { name?: unknown };
              return typeof pathRecord.name === "string" ? pathRecord.name : "";
            })
            .filter(pathPart => pathPart.length > 0)
        : [];
      locationPath = pathParts.join(" » ");
      break;
  }

  const canView = canViewItem(item);
  const canEdit = canEditItem(item);
  const canDelete = canDeleteItem(item);

  return (
    <Paper className="entity-panel-item" elevation={2}>
      <Box className="entity-panel-item-layout">
        <Box className="entity-panel-item-main">
          <Typography component="h3" variant="h6">
            {name}
          </Typography>
          {description !== undefined && description.length > 0 && (
            <Typography component="p" variant="body2">
              {description}
            </Typography>
          )}
          {category === "location" &&
            locationPath !== undefined &&
            locationPath.length > 0 && (
              <Typography color="text.secondary" component="p" variant="body2">
                {locationPath}
              </Typography>
            )}
          {badges.length > 0 && (
            <Box className="entity-panel-badges">
              {badges.map((badge, index) => (
                <GameBadge
                  key={`${badge.type}-${badge.value}-${index.toString()}`}
                  {...badge}
                />
              ))}
            </Box>
          )}
        </Box>
        <Stack
          className="entity-panel-item-actions"
          direction="row"
          spacing={0.5}
        >
          <Tooltip title="View">
            <span>
              <IconButton
                aria-label="View item"
                size="small"
                onClick={() => onViewItem(item)}
                disabled={!canView}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Edit">
            <span>
              <IconButton
                aria-label="Edit item"
                size="small"
                onClick={() => onEditItem(item)}
                disabled={!canEdit}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete">
            <span>
              <IconButton
                aria-label="Delete item"
                size="small"
                onClick={() => onDeleteItem(item)}
                disabled={!canDelete}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>
    </Paper>
  );
};

export const EntityPanelContent = <Category extends string, Item>({
  tab,
  items,
  loading,
  error,
  onViewItem,
  canViewItem,
  onEditItem,
  canEditItem,
  onDeleteItem,
  canDeleteItem,
}: EntityPanelContentProps<Category, Item>) => {
  if (!tab) {
    return <Alert severity="error">404</Alert>;
  }

  const typeLabel = (tab.label ?? tab.category).toLowerCase();

  if (loading) {
    return <Typography>Loading {typeLabel}...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (items.length === 0) {
    return <Alert severity="info">No {typeLabel} found.</Alert>;
  }

  return (
    <Stack className="entity-panel-items" component="ul" spacing={1.5}>
      {items.map((item, index) => (
        <Box key={index} component="li">
          {renderItem(
            item,
            tab.category,
            onViewItem,
            canViewItem,
            onEditItem,
            canEditItem,
            onDeleteItem,
            canDeleteItem,
          )}
        </Box>
      ))}
    </Stack>
  );
};
