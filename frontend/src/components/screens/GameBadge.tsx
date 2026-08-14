import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LabelImportantIcon from "@mui/icons-material/LabelImportant";
import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";
import TagIcon from "@mui/icons-material/Tag";
import { Chip } from "@mui/material";
import { Link } from "react-router";

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
  to?: string;
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

export const GameBadge = ({ type, value, tooltip, to }: GameBadgeProps) => {
  const linkProps =
    to === undefined ? {} : ({ clickable: true, component: Link, to } as const);

  return (
    <Chip
      {...linkProps}
      icon={badgeIcon(type)}
      label={value}
      size="small"
      variant="outlined"
      title={tooltip}
      sx={{
        px: 1.2,
        py: 2,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        "& .MuiChip-icon": {
          display: "flex",
          alignItems: "center",
          marginTop: 0,
          marginBottom: 0,
          marginRight: 0.1,
        },
        "& .MuiChip-label": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          paddingTop: "1px",
        },
      }}
    />
  );
};
