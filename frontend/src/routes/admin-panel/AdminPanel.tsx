import axios from "axios"
import type React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router"

import { selectAccessToken } from "../../store/features/currentUserSlice"
import { useAppSelector } from "../../store/hooks"
import type { PermissionResponseDto } from "../../dto/permission.dto"
import type { RoleResponseDto } from "../../dto/role.dto"
import type { UserResponseDto } from "../../dto/user.dto"

import "./admin-panel.scss"

export type AdminPanelCategory = "permissions" | "roles" | "users"

export type AdminPanelProps = {
  content?: AdminPanelCategory
}

const PAGE_SIZE = 10

type AdminPanelItem =
  | PermissionResponseDto
  | RoleResponseDto
  | UserResponseDto

type PaginatedResponse<T> = {
  page: T[]
  total: number
}

const renderValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return ""
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value)
  }

  return JSON.stringify(value)
}

const renderItem = (item: AdminPanelItem) => {
  const itemRecord = item as Record<string, unknown>
  const keys = Object.keys(itemRecord)
  if (keys.length === 0) {
    return <span>{JSON.stringify(item)}</span>
  }

  return (
    <div className="admin-item">
      {keys.map(key => (
        <div key={key}>
          <strong>{key}</strong>: {renderValue(itemRecord[key])}
        </div>
      ))}
    </div>
  )
}

export const AdminPanel: React.FC<AdminPanelProps> = (
  props: AdminPanelProps,
) => {
  const { content } = props
  const accessToken = useAppSelector(selectAccessToken)
  const [page, setPage] = useState(0)
  const [items, setItems] = useState<AdminPanelItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

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

  const contentElement = ((_content?: AdminPanelCategory) => {
    if (!_content) {
      return <div>404</div>
    }

    if (loading) {
      return <div>Loading {_content}…</div>
    }

    if (error) {
      return <div>{error}</div>
    }

    if (items.length === 0) {
      return <div>No {_content} found.</div>
    }

    return (
      <div>
        <h4>{`${_content.charAt(0).toUpperCase()}${_content.slice(1)}`}</h4>
        <ul>
          {items.map((item, index) => (
            <li key={index}>{renderItem(item)}</li>
          ))}
        </ul>
      </div>
    )
  })(content)

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
