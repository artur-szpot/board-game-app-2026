/* eslint-disable no-case-declarations */
import LabelImportantIcon from "@mui/icons-material/LabelImportant";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Chip } from "@mui/material";

import { GameDataType } from "../../components/screens/selection-strategies";
import type { GameResponseDto } from "../../dto/collection-items.dto";
import type { EntityPanelTab } from "./entity-panel-types";
import { AdminDataType } from "../admin-panel/admin-data-type.enum";

type EntityPanelContentProps<Category extends string, Item> = {
  tab?: EntityPanelTab<Category>;
  items: Item[];
  loading: boolean;
  error?: string;
};

enum BadgeTypeEnum {
  PLAYER_COUNT = "PLAYER_COUNT",
  GAME_LENGTH = "GAME_LENGTH",
  TAG = "TAG",
}

const renderItem = (item: unknown, category: string) => {
  const record = (item ?? {}) as Record<string, unknown>;
  let name =
    typeof record.name === "string" && record.name.length > 0
      ? record.name
      : "NO NAME FOUND";
  let description =
    typeof record.description === "string" ? record.description : undefined;
  const badges: { type: BadgeTypeEnum; value: string; tooltip?: string }[] = [];

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
  }

  const badgeIcon = (badgeType: BadgeTypeEnum) => {
    switch (badgeType) {
      case BadgeTypeEnum.GAME_LENGTH:
        return <AccessTimeIcon color="success" />;
      case BadgeTypeEnum.PLAYER_COUNT:
        return <PersonIcon />;
      default:
        return <LabelImportantIcon />;
    }
  };

  return (
    <div className="entity-panel-item">
      <h3>{name}</h3>
      {description !== undefined && description.length > 0 && (
        <p>{description}</p>
      )}
      <div className="entity-panel-badges">
        {badges.map((badge, index) => (
          <Chip
            key={`${badge.type}-${badge.value}-${index.toString()}`}
            icon={badgeIcon(badge.type)}
            label={badge.value}
            size="small"
            variant="outlined"
            title={badge.tooltip}
          />
        ))}
      </div>
    </div>
  );
};

export const EntityPanelContent = <Category extends string, Item>({
  tab,
  items,
  loading,
  error,
}: EntityPanelContentProps<Category, Item>) => {
  if (!tab) {
    return <div>404</div>;
  }

  const typeLabel = (tab.label ?? tab.category).toLowerCase();

  if (loading) {
    return <div>Loading {typeLabel}...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (items.length === 0) {
    return <div>No {typeLabel} found.</div>;
  }

  return (
    <div className="entity-panel-items">
      <ul>
        {items.map((item, index) => (
          <li key={index}>{renderItem(item, tab.category)}</li>
        ))}
      </ul>
    </div>
  );
};
