import type { UnknownAction } from "@reduxjs/toolkit";

import type { FormScreenProps } from "../../components/screens/FormScreenProps";

export type EntityPanelTab<Category extends string, Item> = {
  category: Category;
  label?: string;
  routeSegment?: string;
  createScreen?: FormScreenProps;
  viewScreen?: (item: Item) => UnknownAction;
  editScreen?: (item: Item) => UnknownAction;
  deleteEndpoint?: (item: Item) => string;
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
