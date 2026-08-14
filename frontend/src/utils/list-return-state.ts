import { useLocation } from "react-router";

/** Carries the list's pagination query string through history state so detail URLs stay clean. */
export type ListReturnState = {
  listSearch: string;
};

export const buildListReturnState = (listSearch: string): ListReturnState => {
  return { listSearch };
};

export const useListSearch = (): string => {
  const state = useLocation().state as unknown;
  const listSearch = (state as Partial<ListReturnState> | null)?.listSearch;
  return typeof listSearch === "string" ? listSearch : "";
};
