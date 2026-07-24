import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { selectAccessToken } from "../../store/features/currentUserSlice";
import {
  openFormFrame,
  resetToBottomFrame,
} from "../../store/features/frameStackSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

import { EntityPanelContent } from "./EntityPanelContent";
import type {
  EntityPanelProps,
  EntityPanelTab,
  PaginatedResponse,
} from "./entity-panel-types";
import { DEFAULT_PAGE_SIZE } from "./entity-panel-types";

import "./entity-panel.scss";

const INPUT_STABILITY_IN_MS = 500;

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

export const EntityPanel = <Category extends string, Item>({
  getItemsFromResponse,
  title,
  basePath,
  tabs,
  content,
  pageSize = DEFAULT_PAGE_SIZE,
  fetchErrorMessage = "Unable to load items",
}: EntityPanelProps<Category, Item>) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const labelledTabs = useMemo(() => withDefaultLabels(tabs), [tabs]);
  const activeTab = labelledTabs.find(tab => tab.category === content);

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

    const timer = window.setTimeout(() => {
      const fetchItems = async () => {
        setLoading(true);
        setError(undefined);

        try {
          const trimmedSearchTerm = searchTerm.trim();
          const response = await axios.get<PaginatedResponse<Item>>(
            `${import.meta.env.VITE_API_URL as string}/${activeTab.endpoint}`,
            {
              params: {
                pageNumber: page,
                pageSize,
                searchTerm: trimmedSearchTerm === "" ? undefined : trimmedSearchTerm,
              },
              headers: accessToken
                ? {
                    Authorization: `Bearer ${accessToken}`,
                  }
                : undefined,
            },
          );

          const responseItems = getItemsFromResponse
            ? getItemsFromResponse(response.data)
            : response.data.page;

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
    }, INPUT_STABILITY_IN_MS);

    return () => window.clearTimeout(timer);
  }, [
    activeTab,
    page,
    pageSize,
    searchTerm,
    accessToken,
    fetchErrorMessage,
    getItemsFromResponse,
  ]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const panelLink = (category: Category) => {
    const active = content === category;
    const tab = labelledTabs.find(candidate => candidate.category === category);
    const routeSegment = tab?.routeSegment ?? category;
    return (
      <Link
        key={category}
        to={active ? "" : `${basePath}/${routeSegment}`}
        className={active ? "active" : ""}
      >
        {tab?.label ?? category}
      </Link>
    );
  };

  const onAddClick = () => {
    if (!activeTab?.createScreen) {
      return;
    }

    dispatch(openFormFrame({params: activeTab.createScreen}));
  };

  const onClearSearch = () => {
    setSearchTerm("");
  };

  const totalPages = Math.ceil(total / pageSize);
  const showPagination =
    !loading && !error && Boolean(activeTab) && totalPages > 0;

  return (
    <>
      <div className="entity-panel-nav">
        <h3>{title}</h3>
        {labelledTabs.map(tab => panelLink(tab.category))}
      </div>
      <div className="entity-panel-content">
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
            placeholder="Find..."
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
          <Pagination
            className="entity-panel-pagination"
            count={totalPages}
            page={page + 1}
            onChange={(_event, nextPage) => setPage(nextPage - 1)}
            shape="rounded"
            disabled={totalPages <= 1}
          />
        )}
      </div>
    </>
  );
};
