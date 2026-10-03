import type { UnknownAction } from "@reduxjs/toolkit";
import type { PermissionType } from "../../dto/user-data.dto";

import type { FormScreenProps } from "../../components/screens/FormScreenProps";
import type { GameDataType } from "../../components/screens/selection-strategies";

export enum EntityPanelFilterKind {
  NUMBER = "NUMBER",
  SELECT = "SELECT",
  TRI_STATE = "TRI_STATE",
  ENTITY_SELECTION = "ENTITY_SELECTION",
}

type EntityPanelFilterBase = {
  /** Sent to the API in the filters map and used as the URL parameter suffix. */
  key: string;
  label: string;
};

export type EntityPanelNumberFilter = EntityPanelFilterBase & {
  kind: EntityPanelFilterKind.NUMBER;
};

export type EntityPanelSelectFilter = EntityPanelFilterBase & {
  kind: EntityPanelFilterKind.SELECT;
  options: { value: string; label: string }[];
};

export type EntityPanelTriStateFilter = EntityPanelFilterBase & {
  kind: EntityPanelFilterKind.TRI_STATE;
  trueLabel: string;
  falseLabel: string;
};

export type EntityPanelEntitySelectionFilter = EntityPanelFilterBase & {
  kind: EntityPanelFilterKind.ENTITY_SELECTION;
  dataTypes: GameDataType[];
  /** Used to resolve names of the ids restored from the URL, as `${endpoint}/${id}`. */
  detailEndpoint: string;
};

export type EntityPanelFilterDefinition =
  | EntityPanelNumberFilter
  | EntityPanelSelectFilter
  | EntityPanelTriStateFilter
  | EntityPanelEntitySelectionFilter;

export type EntityPanelTab<Category extends string, Item> = {
  category: Category;
  requiredPermission?: PermissionType;
  label?: string;
  routeSegment?: string;
  createScreen?: FormScreenProps;
  // For tabs whose create screen is not a generic form.
  createAction?: () => UnknownAction;
  viewPath?: (item: Item) => string;
  viewScreen?: (item: Item) => UnknownAction;
  editScreen?: (item: Item) => UnknownAction;
  deleteEndpoint?: (item: Item) => string;
  filters?: EntityPanelFilterDefinition[];
};

type SearchResultWithDetail<Type extends string, Detail> = {
  id: string;
  name: string;
  type: Type;
  detail?: Detail;
};

export type SearchResult<
  ItemType extends string,
  DetailByType extends Record<ItemType, unknown>,
> = {
  [Type in ItemType]: SearchResultWithDetail<Type, DetailByType[Type]>;
}[ItemType];

export type SearchResponse<
  ItemType extends string,
  DetailByType extends Record<ItemType, unknown>,
> = {
  results: SearchResult<ItemType, DetailByType>[];
  total: number;
};

export type EntityPanelProps<
  Category extends string,
  Item,
  DetailByType extends Record<Category, unknown>,
> = {
  getItemsFromResponse?: (
    data: SearchResponse<Category, DetailByType>,
  ) => Item[];
  title: string;
  basePath: string;
  searchEndpoint: string;
  tabs: EntityPanelTab<Category, Item>[];
  content?: Category;
  pageSize?: number;
  includeDetail?: boolean;
  fetchErrorMessage?: string;
};

export const DEFAULT_PAGE_SIZE = 3;
