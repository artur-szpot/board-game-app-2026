import type { FormScreenProps } from "../../components/screens/FormScreenProps";

export type EntityPanelTab<Category extends string> = {
  category: Category;
  endpoint: string;
  label?: string;
  routeSegment?: string;
  createScreen?: FormScreenProps;
};

export type EntityPanelProps<Category extends string, Item> = {
  getItemsFromResponse?: (data: PaginatedResponse<Item>) => Item[];
  title: string;
  basePath: string;
  tabs: EntityPanelTab<Category>[];
  content?: Category;
  pageSize?: number;
  fetchErrorMessage?: string;
};

export type PaginatedResponse<T> = {
  page: T[];
  total: number;
};

export const DEFAULT_PAGE_SIZE = 3;
