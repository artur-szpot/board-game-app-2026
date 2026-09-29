import type { SvgIconComponent } from "@mui/icons-material";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import BoltIcon from "@mui/icons-material/Bolt";
import CastleIcon from "@mui/icons-material/Castle";
import DiamondIcon from "@mui/icons-material/Diamond";
import FlagIcon from "@mui/icons-material/Flag";
import ForestIcon from "@mui/icons-material/Forest";
import GroupsIcon from "@mui/icons-material/Groups";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ScienceIcon from "@mui/icons-material/Science";
import StarIcon from "@mui/icons-material/Star";
import WaterDropIcon from "@mui/icons-material/WaterDrop";

// Curated subset; ids are persisted in the schema JSON so they must stay stable.
export const SCORING_ICONS: {
  id: string;
  label: string;
  Icon: SvgIconComponent;
}[] = [
  { id: "coin", label: "Coin", Icon: MonetizationOnIcon },
  { id: "star", label: "Star", Icon: StarIcon },
  { id: "castle", label: "Castle", Icon: CastleIcon },
  { id: "agriculture", label: "Agriculture", Icon: AgricultureIcon },
  { id: "science", label: "Science", Icon: ScienceIcon },
  { id: "groups", label: "Groups", Icon: GroupsIcon },
  { id: "military", label: "Military", Icon: MilitaryTechIcon },
  { id: "forest", label: "Forest", Icon: ForestIcon },
  { id: "water", label: "Water", Icon: WaterDropIcon },
  { id: "bolt", label: "Energy", Icon: BoltIcon },
  { id: "diamond", label: "Diamond", Icon: DiamondIcon },
  { id: "flag", label: "Flag", Icon: FlagIcon },
];

const SCORING_ICONS_BY_ID = new Map(
  SCORING_ICONS.map(entry => [entry.id, entry]),
);

export const getScoringIcon = (id?: string) =>
  id === undefined ? undefined : SCORING_ICONS_BY_ID.get(id);
