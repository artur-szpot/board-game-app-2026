export type EntityPanelTab<Category extends string> = {
  category: Category;
  endpoint: string;
  label?: string;
  routeSegment?: string;
};

export type EntityPanelProps<Category extends string, Item> = {
  getItemsFromResponse?: (
    data: PaginatedResponse<Item> | Item[],
  ) => Item[];
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

export const DEFAULT_PAGE_SIZE = 10;
