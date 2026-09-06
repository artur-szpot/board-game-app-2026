from enum import Enum
from typing import List

from pydantic import BaseModel


class ShuffleRequestBody(BaseModel):
    total: int | None
    items: List[int] | None


class ChooseRequestBody(ShuffleRequestBody):
    choose: int
    shuffle: bool


class PlacementRuleName(str, Enum):
    must_be_central = "must_be_central"  # takes no args
    must_not_share_column_with = "must_not_share_column_with"  # args: forbidden neighbors
    must_not_share_row_with = "must_not_share_row_with"  # args: forbidden neighbors
    must_keep_distance_from = "must_keep_distance_from"  # args: distance, then forbidden neighbors


class PlacementRuleItem(BaseModel):
    rule: PlacementRuleName
    args: List[int]


class PlacementRule(BaseModel):
    rules: List[PlacementRuleItem]
    target: int


class RectangularSpreadRequestBody(ShuffleRequestBody):
    width: int
    placement_rules: List[PlacementRule] | None


class ChooseResponse(BaseModel):
    chosen: List[int]
    left: List[int]
