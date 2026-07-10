import axios from "axios"
import type React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router"

import { selectAccessToken } from "../../store/features/currentUserSlice"
import { resetToBottomFrame } from "../../store/features/frameStackSlice"
import { useAppDispatch, useAppSelector } from "../../store/hooks"

import "./admin-panel.scss"
import type {
  AdminPanelCategory,
  AdminPanelItem,
  AdminPanelProps,
  PaginatedResponse,
} from "./admin-types"
import { PAGE_SIZE } from "./admin-types"
import { AdminPanelContent } from "./AdminPanelContent"

export const AdminPanel: React.FC<AdminPanelProps> = (
  props: AdminPanelProps,
) => {
  const { content } = props
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector(selectAccessToken)
  const [page, setPage] = useState(0)
  const [items, setItems] = useState<AdminPanelItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    dispatch(resetToBottomFrame())
  }, [dispatch])

  useEffect(() => {
    setPage(0)
  }, [content])

  useEffect(() => {
    if (!content) {
      setItems([])
      setError(undefined)
      return
    }

    const fetchItems = async () => {
      setLoading(true)
      setError(undefined)

      try {
        const response = await axios.get<PaginatedResponse<AdminPanelItem>>(
          `${import.meta.env.VITE_API_URL as string}/${content}`,
          {
            params: {
              pageNumber: page,
              pageSize: PAGE_SIZE,
            },
            headers: accessToken
              ? {
                  Authorization: `Bearer ${accessToken}`,
                }
              : undefined,
          },
        )
        setItems(response.data.page)
      } catch {
        setError("Unable to load admin items")
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    void fetchItems()
  }, [content, page, accessToken])

  const adminLink = (category: AdminPanelCategory) => {
    const active = content === category
    return (
      <Link
        to={active ? "" : `/admin/${category}`}
        className={active ? "active" : ""}
      >{`${category.charAt(0).toUpperCase()}${category.slice(1).toLowerCase()}`}</Link>
    )
  }

  const contentElement = (
    <AdminPanelContent
      content={content}
      items={items}
      loading={loading}
      error={error}
    />
  )

  return (
    <>
      <div className="admin-nav">
        <h3>Admin panel</h3>
        {adminLink("permissions")}
        {adminLink("roles")}
        {adminLink("users")}
      </div>
      <div className="admin-content">{contentElement}</div>
    </>
  )
}
