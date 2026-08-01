import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LabelImportantIcon from "@mui/icons-material/LabelImportant";
import PersonIcon from "@mui/icons-material/Person";
import { Chip } from "@mui/material";

export enum BadgeTypeEnum {
  PLAYER_COUNT = "PLAYER_COUNT",
  GAME_LENGTH = "GAME_LENGTH",
  TAG = "TAG",
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
