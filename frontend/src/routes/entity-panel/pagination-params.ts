export const PAGE_PARAM = "page";
export const PAGE_SIZE_PARAM = "pageSize";
export const PAGE_SIZE_OPTIONS = [3, 10, 50] as const;

const parsePositiveInteger = (value: string | null): number | undefined => {
  if (value === null || !/^\d+$/.test(value)) {
    return undefined;
  }

  const parsed = Number(value);
  return parsed >= 1 ? parsed : undefined;
};

/** URL pagination is one-based, while the returned page index and the API are zero-based. */
export const parsePaginationParams = (
  searchParams: URLSearchParams,
  defaultPageSize: number,
): { page: number; pageSize: number } => {
  const requestedPage = parsePositiveInteger(searchParams.get(PAGE_PARAM));
  const requestedPageSize = parsePositiveInteger(
    searchParams.get(PAGE_SIZE_PARAM),
  );

  const isAllowedPageSize =
    requestedPageSize !== undefined &&
    (requestedPageSize === defaultPageSize ||
      PAGE_SIZE_OPTIONS.some(option => option === requestedPageSize));

  return {
    page: requestedPage === undefined ? 0 : requestedPage - 1,
    pageSize: isAllowedPageSize ? requestedPageSize : defaultPageSize,
  };
};

export const buildPaginationSearch = (
  searchParams: URLSearchParams,
  page: number,
  pageSize: number,
  defaultPageSize: number,
): URLSearchParams => {
  const next = new URLSearchParams(searchParams);

  if (page <= 0) {
    next.delete(PAGE_PARAM);
  } else {
    next.set(PAGE_PARAM, String(page + 1));
  }

  if (pageSize === defaultPageSize) {
    next.delete(PAGE_SIZE_PARAM);
  } else {
    next.set(PAGE_SIZE_PARAM, String(pageSize));
  }

  return next;
};
