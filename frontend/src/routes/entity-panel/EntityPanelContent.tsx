/* eslint-disable no-case-declarations */
import {
  Alert,
  Box,
  ButtonBase,
  Paper,
  Stack,
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
  onViewItem?: (item: Item) => void;
};

const renderItem = <Item,>(
  item: Item,
  category: string,
  onViewItem?: (item: Item) => void,
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

  return (
    <Paper className="entity-panel-item" elevation={2}>
      {onViewItem ? (
        <ButtonBase
          className="entity-panel-item-title-action"
          onClick={() => onViewItem(item)}
        >
          <Typography component="h3" variant="h6">
            {name}
          </Typography>
        </ButtonBase>
      ) : (
        <Typography component="h3" variant="h6">
          {name}
        </Typography>
      )}
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
    </Paper>
  );
};

export const EntityPanelContent = <Category extends string, Item>({
  tab,
  items,
  loading,
  error,
  onViewItem,
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
          {renderItem(item, tab.category, onViewItem)}
        </Box>
      ))}
    </Stack>
  );
};
