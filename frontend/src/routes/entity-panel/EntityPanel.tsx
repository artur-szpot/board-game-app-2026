import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Box,
  Alert,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import type { UnknownAction } from "@reduxjs/toolkit";
import axios from "axios";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";

import { FrameStackScreenWrapper } from "../../components/frames/FrameStackScreenWrapper";
import {
  selectAccessToken,
  selectPermissions,
} from "../../store/features/currentUserSlice";
import {
  FrameTypeEnum,
  openFormFrame,
  resetToBottomFrame,
  selectTopFrame,
} from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { extractApiErrorMessages } from "../../utils/api-error";
import {
  buildListReturnState,
  type ListReturnState,
} from "../../utils/list-return-state";

import { EntityPanelContent } from "./EntityPanelContent";
import { EntityPanelFilters } from "./EntityPanelFilters";
import type {
  EntityPanelProps,
  EntityPanelTab,
  SearchResponse,
} from "./entity-panel-types";
import { DEFAULT_PAGE_SIZE } from "./entity-panel-types";
import type { EntityPanelFilterValues } from "./filter-params";
import {
  buildFilterSearch,
  clearFilterSearch,
  parseFilterParams,
} from "./filter-params";
import {
  buildPaginationSearch,
  PAGE_SIZE_OPTIONS,
  parsePaginationParams,
} from "./pagination-params";

import { PermissionLevel, PermissionType } from "../../dto/user-data.dto";
import { hasRequiredPermissions } from "../../utils/useHasRequiredPermissions";
import "./entity-panel.scss";

const INPUT_STABILITY_IN_MS = 500;

type RouteFrameIntent = {
  routeSegment: string;
  mode: "new" | "definition";
  id?: string;
};

const resolveRouteFrameIntent = <Category extends string, Item>(
  basePath: string,
  tabs: EntityPanelTab<Category, Item>[],
  pathname: string,
): RouteFrameIntent | undefined => {
  const normalizedBasePath = basePath.replace(/\/+$/, "");

  for (const tab of tabs) {
    const routeSegment = tab.routeSegment ?? tab.category;
    const tabPrefix = `${normalizedBasePath}/${routeSegment}`;

    if (pathname === `${tabPrefix}/new`) {
      return {
        routeSegment,
        mode: "new",
      };
    }

    const definitionPathRegex = new RegExp(
      `^${tabPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/([^/]+)/definition$`,
    );
    const match = definitionPathRegex.exec(pathname);
    if (match) {
      return {
        routeSegment,
        mode: "definition",
        id: decodeURIComponent(match[1]),
      };
    }
  }

  return undefined;
};

const getLastPageIndex = (itemsTotal: number, pageSize: number): number => {
  return Math.max(0, Math.ceil(itemsTotal / pageSize) - 1);
};

const toTitleCase = (value: string) => {
  return value
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const withDefaultLabels = <Category extends string, Item>(
  tabs: EntityPanelTab<Category, Item>[],
): EntityPanelTab<Category, Item>[] => {
  return tabs.map(tab => ({
    ...tab,
    label: tab.label ?? toTitleCase(tab.category),
  }));
};

export const EntityPanel = <
  Category extends string,
  Item,
  DetailByType extends Record<Category, unknown>,
>({
  getItemsFromResponse,
  title,
  basePath,
  searchEndpoint,
  tabs,
  content,
  pageSize = DEFAULT_PAGE_SIZE,
  includeDetail = true,
  fetchErrorMessage = "Unable to load items",
}: EntityPanelProps<Category, Item, DetailByType>) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const permissions = useAppSelector(selectPermissions);
  const userId = useAppSelector(
    state => (state.currentUser as { id?: string }).id,
  );
  const topFrame = useAppSelector(selectTopFrame);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, pageSize: currentPageSize } = useMemo(
    () => parsePaginationParams(searchParams, pageSize),
    [pageSize, searchParams],
  );
  const setPagination = useCallback(
    (nextPage: number, nextPageSize: number) => {
      setSearchParams(
        current =>
          buildPaginationSearch(current, nextPage, nextPageSize, pageSize),
        { replace: true },
      );
    },
    [pageSize, setSearchParams],
  );
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [itemPendingDelete, setItemPendingDelete] = useState<
    Item | undefined
  >();
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const previousContentRef = useRef(content);
  const previousSearchTermRef = useRef(searchTerm);
  const [openedRouteLocationKey, setOpenedRouteLocationKey] = useState<
    string | undefined
  >();

  const labeledTabs = useMemo(
    () =>
      withDefaultLabels(tabs).filter(
        tab =>
          !tab.requiredPermission ||
          hasRequiredPermissions(permissions, {
            [tab.requiredPermission]: PermissionLevel.READ,
          }),
      ),
    [tabs, permissions],
  );
  const activeTab = labeledTabs.find(tab => tab.category === content);
  const routeFrameIntent = useMemo(
    () => resolveRouteFrameIntent(basePath, labeledTabs, location.pathname),
    [basePath, labeledTabs, location.pathname],
  );
  const accessDenied = tabs.some(tab => tab.category === content) && !activeTab;
  const canWriteTab =
    !activeTab?.requiredPermission ||
    hasRequiredPermissions(permissions, {
      [activeTab.requiredPermission]: PermissionLevel.FULL,
    });
  const filterDefinitions = useMemo(
    () => activeTab?.filters ?? [],
    [activeTab],
  );
  const filterValues = useMemo(
    () => parseFilterParams(searchParams, filterDefinitions),
    [filterDefinitions, searchParams],
  );
  // Changing a filter invalidates the current page, so pagination resets with it.
  const setFilters = useCallback(
    (patch: EntityPanelFilterValues) => {
      setSearchParams(
        current =>
          buildPaginationSearch(
            buildFilterSearch(current, patch, filterDefinitions),
            0,
            currentPageSize,
            pageSize,
          ),
        { replace: true },
      );
    },
    [currentPageSize, filterDefinitions, pageSize, setSearchParams],
  );
  const clearFilters = useCallback(() => {
    setSearchParams(
      current =>
        buildPaginationSearch(
          clearFilterSearch(current),
          0,
          currentPageSize,
          pageSize,
        ),
      { replace: true },
    );
  }, [currentPageSize, pageSize, setSearchParams]);
  const isTopFrameSelf = topFrame?.frameType === FrameTypeEnum.SELF;
  const hasSystemCollectionFullPermission = useMemo(
    () =>
      (permissions ?? []).some(
        permission =>
          permission.permissionType === PermissionType.SYSTEM_COLLECTION &&
          permission.permissionLevel === PermissionLevel.FULL,
      ),
    [permissions],
  );

  const toRecord = useCallback((item: Item): Record<string, unknown> => {
    return (item ?? {}) as Record<string, unknown>;
  }, []);

  const getItemName = (item: Item): string => {
    const record = toRecord(item);
    if (typeof record.name === "string" && record.name.length > 0) {
      return record.name;
    }
    if (typeof record.username === "string" && record.username.length > 0) {
      return record.username;
    }
    if (
      typeof record.permissionType === "string" &&
      record.permissionType.length > 0
    ) {
      return record.permissionType;
    }
    if (typeof record.id === "string" && record.id.length > 0) {
      return record.id;
    }
    return "this item";
  };

  const isOwnedOrAllowed = useCallback(
    (item: Item): boolean => {
      const record = toRecord(item);

      if (record.protectedRole === true) {
        return false;
      }

      if (typeof record.ownerId !== "string") {
        return true;
      }

      if (!userId) {
        return false;
      }

      if (record.ownerId === userId) {
        return true;
      }

      return record.ownerId === "SYSTEM" && hasSystemCollectionFullPermission;
    },
    [hasSystemCollectionFullPermission, toRecord, userId],
  );

  useLayoutEffect(() => {
    dispatch(resetToBottomFrame());
  }, [dispatch, location.key]);

  useEffect(() => {
    setOpenedRouteLocationKey(undefined);
    if (!routeFrameIntent) {
      return;
    }
    const tabForRoute = labeledTabs.find(
      tab =>
        (tab.routeSegment ?? tab.category) === routeFrameIntent.routeSegment,
    );
    if (!tabForRoute) {
      return;
    }

    let cancelled = false;
    const openFrame = (action: UnknownAction) => {
      dispatch(action);
      setOpenedRouteLocationKey(location.key);
    };

    const openRouteFrame = async () => {
      if (routeFrameIntent.mode === "new") {
        if (!canWriteTab) {
          setError("You do not have permission to edit this tab.");
          return;
        }
        if (tabForRoute.createAction) {
          openFrame(tabForRoute.createAction());
          return;
        }
        if (tabForRoute.createScreen) {
          openFrame(openFormFrame({ params: tabForRoute.createScreen }));
        }
        return;
      }

      if (!routeFrameIntent.id || !tabForRoute.detailEndpoint) {
        return;
      }

      setLoading(true);
      setError(undefined);
      try {
        const response = await axios.get<Item>(
          `${import.meta.env.VITE_API_URL as string}/${tabForRoute.detailEndpoint(routeFrameIntent.id)}`,
          {
            headers: accessToken
              ? {
                  Authorization: `Bearer ${accessToken}`,
                }
              : undefined,
          },
        );
        if (cancelled) {
          return;
        }
        const item = response.data;
        const canEdit = canWriteTab && isOwnedOrAllowed(item);
        if (canEdit && tabForRoute.editScreen) {
          openFrame(tabForRoute.editScreen(item));
          return;
        }
        if (tabForRoute.viewScreen) {
          openFrame(tabForRoute.viewScreen(item));
        }
      } catch (error) {
        if (!cancelled) {
          setError(extractApiErrorMessages(error).join(" "));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void openRouteFrame();
    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    canWriteTab,
    dispatch,
    isOwnedOrAllowed,
    labeledTabs,
    location.key,
    routeFrameIntent,
  ]);

  useEffect(() => {
    if (!routeFrameIntent) {
      return;
    }
    if (openedRouteLocationKey !== location.key) {
      return;
    }
    if (topFrame?.frameType !== FrameTypeEnum.SELF) {
      return;
    }

    const locationState = location.state as
      | (Partial<ListReturnState> & { routeFrameFromList?: boolean })
      | null;
    if (locationState?.routeFrameFromList === true) {
      void navigate(-1);
      return;
    }
    const listSearch =
      typeof locationState?.listSearch === "string"
        ? locationState.listSearch
        : "";
    void navigate(
      {
        pathname: `${basePath}/${routeFrameIntent.routeSegment}`,
        search: listSearch,
      },
      { replace: true },
    );
  }, [
    basePath,
    location.key,
    location.state,
    navigate,
    openedRouteLocationKey,
    routeFrameIntent,
    topFrame?.frameType,
  ]);

  const fetchItems = useCallback(async () => {
    if (!activeTab) {
      setItems([]);
      setTotal(0);
      setError(undefined);
      return;
    }

    if (!isTopFrameSelf || routeFrameIntent) {
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const trimmedSearchTerm = searchTerm.trim();
      const response = await axios.post<SearchResponse<Category, DetailByType>>(
        `${import.meta.env.VITE_API_URL as string}/${searchEndpoint}`,
        {
          types: [activeTab.category],
          searchTerm: trimmedSearchTerm === "" ? undefined : trimmedSearchTerm,
          filters:
            Object.keys(filterValues).length > 0 ? filterValues : undefined,
          includeDetail,
          pagination: {
            pageNumber: page,
            pageSize: currentPageSize,
          },
        },
        {
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : undefined,
        },
      );

      const responseItems = getItemsFromResponse
        ? getItemsFromResponse(response.data)
        : response.data.results.map(
            result => (result.detail ?? result) as Item,
          );

      const lastPageIndex = getLastPageIndex(
        response.data.total,
        currentPageSize,
      );

      // When the current page is no longer valid (e.g. last item on page was deleted),
      // jump to the last available page and let the page-change effect fetch it.
      if (response.data.total > 0 && page > lastPageIndex) {
        setPagination(lastPageIndex, currentPageSize);
        return;
      }

      setItems(responseItems);
      setTotal(response.data.total);
    } catch {
      setError(fetchErrorMessage);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    accessToken,
    activeTab,
    currentPageSize,
    fetchErrorMessage,
    filterValues,
    getItemsFromResponse,
    includeDetail,
    isTopFrameSelf,
    page,
    routeFrameIntent,
    searchEndpoint,
    searchTerm,
    setPagination,
  ]);

  // Pagination now lives in the URL, so it must only be reset on an actual change, never on mount.
  useEffect(() => {
    if (previousContentRef.current === content) {
      return;
    }
    previousContentRef.current = content;
    setSearchTerm("");
    clearFilters();
    setPagination(0, currentPageSize);
  }, [clearFilters, content, currentPageSize, setPagination]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => void fetchItems(),
      searchTerm.length > 0 ? INPUT_STABILITY_IN_MS : 0,
    );

    return () => window.clearTimeout(timer);
  }, [fetchItems, searchTerm]);

  useEffect(() => {
    if (previousSearchTermRef.current === searchTerm) {
      return;
    }
    previousSearchTermRef.current = searchTerm;
    setPagination(0, currentPageSize);
  }, [currentPageSize, searchTerm, setPagination]);

  const selectedTabValue = labeledTabs.some(tab => tab.category === content)
    ? content
    : false;

  const onAddClick = () => {
    if (!canWriteTab) {
      return;
    }
    if (activeTab?.createPath) {
      void navigate(activeTab.createPath, {
        state: {
          ...buildListReturnState(searchParams.toString()),
          routeFrameFromList: true,
        },
      });
      return;
    }
    if (activeTab?.createAction) {
      dispatch(activeTab.createAction());
      return;
    }

    if (!activeTab?.createScreen) {
      return;
    }

    dispatch(openFormFrame({ params: activeTab.createScreen }));
  };

  const onClearSearch = () => {
    setSearchTerm("");
  };

  const onViewItem = (item: Item) => {
    const viewPath = activeTab?.viewPath as
      | ((value: Item) => string)
      | undefined;

    if (viewPath) {
      void navigate(viewPath(item), {
        state: {
          ...buildListReturnState(searchParams.toString()),
          routeFrameFromList: Boolean(activeTab?.detailEndpoint),
        },
      });
      return;
    }

    if (!activeTab?.viewScreen) {
      return;
    }
    dispatch(activeTab.viewScreen(item));
  };

  const onEditItem = (item: Item) => {
    const editPath = activeTab?.editPath as
      | ((value: Item) => string)
      | undefined;
    if (editPath && canWriteTab && isOwnedOrAllowed(item)) {
      void navigate(editPath(item), {
        state: {
          ...buildListReturnState(searchParams.toString()),
          routeFrameFromList: true,
        },
      });
      return;
    }

    const editScreen = activeTab?.editScreen as
      | ((value: Item) => UnknownAction)
      | undefined;

    if (!editScreen || !canWriteTab || !isOwnedOrAllowed(item)) {
      return;
    }
    dispatch(editScreen(item));
  };

  const canViewItem = (item: Item) => {
    void item;
    return Boolean(activeTab?.viewScreen ?? activeTab?.viewPath);
  };

  const canEditItem = (item: Item) => {
    if ((!activeTab?.editScreen && !activeTab?.editPath) || !canWriteTab) {
      return false;
    }
    return isOwnedOrAllowed(item);
  };

  const canDeleteItem = (item: Item) => {
    if (!activeTab?.deleteEndpoint || !canWriteTab) {
      return false;
    }
    return isOwnedOrAllowed(item);
  };

  const onDeleteItem = (item: Item) => {
    if (!canDeleteItem(item)) {
      return;
    }
    setItemPendingDelete(item);
  };

  const onCloseDeleteDialog = () => {
    if (isDeleteSubmitting) {
      return;
    }
    setItemPendingDelete(undefined);
  };

  const onConfirmDelete = async () => {
    if (
      !activeTab?.deleteEndpoint ||
      !itemPendingDelete ||
      !canDeleteItem(itemPendingDelete)
    ) {
      return;
    }

    const resolveDeleteEndpoint = activeTab.deleteEndpoint as
      | ((value: Item) => string)
      | undefined;

    if (!resolveDeleteEndpoint) {
      return;
    }

    const endpoint = resolveDeleteEndpoint(itemPendingDelete).replace(
      /^\//,
      "",
    );

    setIsDeleteSubmitting(true);
    setError(undefined);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL as string}/${endpoint}`,
        {
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : undefined,
        },
      );
      setItemPendingDelete(undefined);
      await fetchItems();
    } catch (error) {
      setError(extractApiErrorMessages(error).join(" "));
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const onPageSizeChange = (nextPageSize: number) => {
    if (nextPageSize === currentPageSize) {
      return;
    }

    const currentTopItemIndex = page * currentPageSize;
    const nextPage = Math.floor(currentTopItemIndex / nextPageSize);
    setPagination(nextPage, nextPageSize);
  };

  const totalPages = Math.ceil(total / currentPageSize);
  const showPagination =
    !loading && !error && Boolean(activeTab) && totalPages > 0;
  const pageStartItem = total === 0 ? 0 : page * currentPageSize + 1;
  const pageEndItem =
    total === 0 ? 0 : Math.min(total, (page + 1) * currentPageSize);

  return (
    <FrameStackScreenWrapper>
      <Paper className="entity-panel-shell" elevation={5}>
        <Box className="entity-panel-header">
          <Typography component="h2" variant="h5">
            {title}
          </Typography>
          <Tabs
            className="entity-panel-tabs"
            value={selectedTabValue}
            variant="scrollable"
            allowScrollButtonsMobile
          >
            {labeledTabs.map(tab => {
              const routeSegment = tab.routeSegment ?? tab.category;
              return (
                <Tab
                  key={tab.category}
                  value={tab.category}
                  label={tab.label ?? tab.category}
                  component={Link}
                  to={`${basePath}/${routeSegment}`}
                />
              );
            })}
          </Tabs>
        </Box>
        <Box className="entity-panel-content">
          <Box className="entity-panel-controls">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddClick}
              disabled={
                !canWriteTab ||
                (!activeTab?.createScreen && !activeTab?.createAction)
              }
            >
              Add
            </Button>
            <TextField
              className="entity-panel-search"
              size="small"
              label="Find"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Clear search"
                        onClick={onClearSearch}
                        edge="end"
                        size="small"
                        disabled={searchTerm.length === 0}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
          {filterDefinitions.length > 0 && (
            <EntityPanelFilters
              definitions={filterDefinitions}
              values={filterValues}
              onChange={setFilters}
              onClear={clearFilters}
            />
          )}
          {accessDenied && (
            <Alert severity="error">
              You do not have permission to view this tab.
            </Alert>
          )}
          {!accessDenied && (
            <EntityPanelContent
              tab={activeTab}
              items={items}
              loading={loading}
              error={error}
              onViewItem={onViewItem}
              canViewItem={canViewItem}
              onEditItem={onEditItem}
              canEditItem={canEditItem}
              onDeleteItem={onDeleteItem}
              canDeleteItem={canDeleteItem}
            />
          )}
          {showPagination && (
            <Box className="entity-panel-pagination-row">
              <Typography
                className="entity-panel-pagination-summary"
                variant="body2"
              >
                Showing items {pageStartItem} to {pageEndItem} of {total}
              </Typography>
              <Pagination
                className="entity-panel-pagination"
                count={totalPages}
                page={page + 1}
                onChange={(_event, nextPage) =>
                  setPagination(nextPage - 1, currentPageSize)
                }
                shape="rounded"
                disabled={totalPages <= 1}
              />
              <Box className="entity-panel-page-size-controls">
                <Typography variant="body2">Items per page</Typography>
                <ButtonGroup
                  size="small"
                  variant="outlined"
                  aria-label="Items per page"
                >
                  {PAGE_SIZE_OPTIONS.map(option => (
                    <Button
                      key={option}
                      type="button"
                      variant={
                        option === currentPageSize ? "contained" : "outlined"
                      }
                      onClick={() => onPageSizeChange(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </ButtonGroup>
              </Box>
            </Box>
          )}
        </Box>
        <Dialog
          open={itemPendingDelete !== undefined}
          onClose={onCloseDeleteDialog}
          aria-labelledby="entity-panel-delete-title"
        >
          <DialogTitle id="entity-panel-delete-title">Delete item</DialogTitle>
          <DialogContent
            sx={{ px: "calc(24px + 10px)", pt: "calc(20px + 10px)" }}
          >
            <DialogContentText>
              Are you sure you want to delete{" "}
              {itemPendingDelete
                ? `"${getItemName(itemPendingDelete)}"`
                : "this item"}
              ?
            </DialogContentText>
          </DialogContent>
          <DialogActions
            sx={{ px: "calc(16px + 10px)", pb: "calc(8px + 10px)" }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={onCloseDeleteDialog}
              disabled={isDeleteSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => void onConfirmDelete()}
              disabled={isDeleteSubmitting}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </FrameStackScreenWrapper>
  );
};
