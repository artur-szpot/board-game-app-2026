import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LabelImportantIcon from "@mui/icons-material/LabelImportant";
import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";
import TagIcon from "@mui/icons-material/Tag";
import { Chip } from "@mui/material";

export enum BadgeTypeEnum {
  PLAYER_COUNT = "PLAYER_COUNT",
  GAME_LENGTH = "GAME_LENGTH",
  TAG = "TAG",
  PUBLIC = "PUBLIC",
  TAG_PARENT = "TAG_PARENT",
}

export type GameBadgeProps = {
  type: BadgeTypeEnum;
  value: string;
  tooltip?: string;
};

export const badgeIcon = (badgeType: BadgeTypeEnum) => {
  switch (badgeType) {
    case BadgeTypeEnum.GAME_LENGTH:
      return <AccessTimeIcon color="success" />;
    case BadgeTypeEnum.PLAYER_COUNT:
      return <PersonIcon />;
    case BadgeTypeEnum.PUBLIC:
      return <PublicIcon color="info" />;
    case BadgeTypeEnum.TAG_PARENT:
      return <TagIcon />;
    default:
      return <LabelImportantIcon />;
  }
};

export const GameBadge = ({ type, value, tooltip }: GameBadgeProps) => (
  <Chip
    icon={badgeIcon(type)}
    label={value}
    size="small"
    variant="outlined"
    title={tooltip}
  />
);
