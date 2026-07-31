import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import {
    Box,
    Button,
    ButtonGroup,
    IconButton,
    InputAdornment,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { FrameStackScreenWrapper } from "../../components/frames/FrameStackScreenWrapper";
import { selectAccessToken } from "../../store/features/currentUserSlice";
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

const toTitleCase = (value: string) => {
  return value
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const withDefaultLabels = <Category extends string>(
  tabs: EntityPanelTab<Category>[],
): EntityPanelTab<Category>[] => {
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
  const topFrame = useAppSelector(selectTopFrame);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const labelledTabs = useMemo(() => withDefaultLabels(tabs), [tabs]);
  const activeTab = labelledTabs.find(tab => tab.category === content);
  const isTopFrameSelf = topFrame?.frameType === FrameTypeEnum.SELF;

  useEffect(() => {
    dispatch(resetToBottomFrame());
  }, [dispatch]);

  useEffect(() => {
    setPage(0);
    setSearchTerm("");
  }, [content]);

  useEffect(() => {
    if (!activeTab) {
      setItems([]);
      setTotal(0);
      setError(undefined);
      return;
    }

    if (!isTopFrameSelf) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        const fetchItems = async () => {
          setLoading(true);
          setError(undefined);

          try {
            const trimmedSearchTerm = searchTerm.trim();
            const response = await axios.post<
              SearchResponse<Category, DetailByType>
            >(
              `${import.meta.env.VITE_API_URL as string}/${searchEndpoint}`,
              {
                types: [activeTab.category],
                searchTerm:
                  trimmedSearchTerm === "" ? undefined : trimmedSearchTerm,
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

            setItems(responseItems);
            setTotal(response.data.total);
          } catch {
            setError(fetchErrorMessage);
            setItems([]);
            setTotal(0);
          } finally {
            setLoading(false);
          }
        };

        void fetchItems();
      },
      searchTerm.length > 0 ? INPUT_STABILITY_IN_MS : 0,
    );

    return () => window.clearTimeout(timer);
  }, [
    activeTab,
    page,
    currentPageSize,
    searchTerm,
    accessToken,
    fetchErrorMessage,
    includeDetail,
    isTopFrameSelf,
    getItemsFromResponse,
    searchEndpoint,
  ]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const selectedTabValue = labelledTabs.some(tab => tab.category === content)
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
            {labelledTabs.map(tab => {
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
      </Paper>
    </FrameStackScreenWrapper>
  );
};
