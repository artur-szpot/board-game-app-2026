import CasinoIcon from "@mui/icons-material/Casino";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import TagIcon from "@mui/icons-material/Tag";
import TocIcon from "@mui/icons-material/Toc";
import type { JSX } from "react";

import { GameDataType } from "./selection-strategies";

export const typeIcon = (type: GameDataType): JSX.Element => {
  switch (type) {
    case GameDataType.TAG:
      return <TagIcon fontSize="small" />;
    case GameDataType.LOCATION:
      return <LocationOnIcon fontSize="small" />;
    case GameDataType.GAME:
      return <CasinoIcon fontSize="small" />;
    case GameDataType.HELPER:
      return <SettingsApplicationsIcon fontSize="small" />;
    case GameDataType.SCORING_SCHEMA:
      return <TocIcon fontSize="small" />;
    default:
      return <HelpCenterIcon fontSize="small" />;
  }
};
