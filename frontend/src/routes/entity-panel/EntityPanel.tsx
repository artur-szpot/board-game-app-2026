import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"

import { selectAccessToken } from "../../store/features/currentUserSlice"
import { resetToBottomFrame } from "../../store/features/frameStackSlice"
import { useAppDispatch, useAppSelector } from "../../store/hooks"

import { EntityPanelContent } from "./EntityPanelContent"
import type {
  EntityPanelProps,
  EntityPanelTab,
  PaginatedResponse,
} from "./entity-panel-types"
import { DEFAULT_PAGE_SIZE } from "./entity-panel-types"

import "./entity-panel.scss"

const toTitleCase = (value: string) => {
  return value
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

const extractItems = <Item,>(data: PaginatedResponse<Item> | Item[]) => {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data.page)) {
    return data.page
  }

  return []
}

const withDefaultLabels = <Category extends string>(
  tabs: EntityPanelTab<Category>[],
): EntityPanelTab<Category>[] => {
  return tabs.map(tab => ({
    ...tab,
    label: tab.label ?? toTitleCase(tab.category),
  }))
}

export const EntityPanel = <Category extends string, Item>({
  getItemsFromResponse,
  title,
  basePath,
  tabs,
  content,
  pageSize = DEFAULT_PAGE_SIZE,
  fetchErrorMessage = "Unable to load items",
}: EntityPanelProps<Category, Item>) => {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector(selectAccessToken)
  const [page, setPage] = useState(0)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const labelledTabs = useMemo(() => withDefaultLabels(tabs), [tabs])
  const activeTab = labelledTabs.find(tab => tab.category === content)

  useEffect(() => {
    dispatch(resetToBottomFrame())
  }, [dispatch])

  useEffect(() => {
    setPage(0)
  }, [content])

  useEffect(() => {
    if (!activeTab) {
      setItems([])
      setError(undefined)
      return
    }

    const fetchItems = async () => {
      setLoading(true)
      setError(undefined)

      try {
        const response = await axios.get<PaginatedResponse<Item> | Item[]>(
          `${import.meta.env.VITE_API_URL as string}/${activeTab.endpoint}`,
          {
            params: {
              pageNumber: page,
              pageSize,
            },
            headers: accessToken
              ? {
                  Authorization: `Bearer ${accessToken}`,
                }
              : undefined,
          },
        )

        const responseItems = getItemsFromResponse
          ? getItemsFromResponse(response.data)
          : extractItems(response.data)
        setItems(responseItems)
      } catch {
        setError(fetchErrorMessage)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    void fetchItems()
  }, [
    activeTab,
    page,
    pageSize,
    accessToken,
    fetchErrorMessage,
    getItemsFromResponse,
  ])

  const panelLink = (category: Category) => {
    const active = content === category
    const tab = labelledTabs.find(candidate => candidate.category === category)
    const routeSegment = tab?.routeSegment ?? category
    return (
      <Link
        key={category}
        to={active ? "" : `${basePath}/${routeSegment}`}
        className={active ? "active" : ""}
      >
        {tab?.label ?? category}
      </Link>
    )
  }

  return (
    <>
      <div className="entity-panel-nav">
        <h3>{title}</h3>
        {labelledTabs.map(tab => panelLink(tab.category))}
      </div>
      <div className="entity-panel-content">
        <EntityPanelContent
          tab={activeTab}
          items={items}
          loading={loading}
          error={error}
        />
      </div>
    </>
  )
}
