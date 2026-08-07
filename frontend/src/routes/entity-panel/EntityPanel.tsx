import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Box,
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

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

import { EntityPanelContent } from "./EntityPanelContent";
import type {
  EntityPanelProps,
  EntityPanelTab,
  SearchResponse,
} from "./entity-panel-types";
import { DEFAULT_PAGE_SIZE } from "./entity-panel-types";

import "./entity-panel.scss";

const INPUT_STABILITY_IN_MS = 500;
const PAGE_SIZE_OPTIONS = [3, 10, 50] as const;

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
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [itemPendingDelete, setItemPendingDelete] = useState<
    Item | undefined
  >();
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  const labeledTabs = useMemo(() => withDefaultLabels(tabs), [tabs]);
  const activeTab = labeledTabs.find(tab => tab.category === content);
  const isTopFrameSelf = topFrame?.frameType === FrameTypeEnum.SELF;
  const hasSystemCollectionFullPermission = useMemo(
    () =>
      (permissions ?? []).some(
        permission =>
          permission.permissionType === "SYSTEM_COLLECTION" &&
          permission.permissionLevel === "FULL",
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

  const fetchItems = useCallback(async () => {
    if (!activeTab) {
      setItems([]);
      setTotal(0);
      setError(undefined);
      return;
    }

    if (!isTopFrameSelf) {
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
        setPage(lastPageIndex);
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
    getItemsFromResponse,
    includeDetail,
    isTopFrameSelf,
    page,
    searchEndpoint,
    searchTerm,
  ]);

  useEffect(() => {
    dispatch(resetToBottomFrame());
  }, [dispatch]);

  useEffect(() => {
    setPage(0);
    setSearchTerm("");
  }, [content]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => void fetchItems(),
      searchTerm.length > 0 ? INPUT_STABILITY_IN_MS : 0,
    );

    return () => window.clearTimeout(timer);
  }, [fetchItems, searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const selectedTabValue = labeledTabs.some(tab => tab.category === content)
    ? content
    : false;

  const onAddClick = () => {
    if (!activeTab?.createScreen) {
      return;
    }

    dispatch(openFormFrame({ params: activeTab.createScreen }));
  };

  const onClearSearch = () => {
    setSearchTerm("");
  };

  const onViewItem = (item: Item) => {
    if (!activeTab?.viewScreen) {
      return;
    }
    dispatch(activeTab.viewScreen(item));
  };

  const onEditItem = (item: Item) => {
    const editScreen = activeTab?.editScreen as
      | ((value: Item) => UnknownAction)
      | undefined;

    if (!editScreen || !isOwnedOrAllowed(item)) {
      return;
    }
    dispatch(editScreen(item));
  };

  const canViewItem = (item: Item) => {
    void item;
    return Boolean(activeTab?.viewScreen);
  };

  const canEditItem = (item: Item) => {
    if (!activeTab?.editScreen) {
      return false;
    }
    return isOwnedOrAllowed(item);
  };

  const canDeleteItem = (item: Item) => {
    if (!activeTab?.deleteEndpoint) {
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
    if (!activeTab?.deleteEndpoint || !itemPendingDelete) {
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
    } catch {
      setError("Unable to delete item");
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
    setCurrentPageSize(nextPageSize);
    setPage(nextPage);
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
              disabled={!activeTab?.createScreen}
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
                onChange={(_event, nextPage) => setPage(nextPage - 1)}
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
