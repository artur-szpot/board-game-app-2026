import type { AdminPanelCategory, AdminPanelItem } from "./admin-types"

export type AdminPanelContentProps = {
  content?: AdminPanelCategory
  items: AdminPanelItem[]
  loading: boolean
  error?: string
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

export const AdminPanelContent: React.FC<AdminPanelContentProps> = ({
  content,
  items,
  loading,
  error,
}) => {
  if (!content) {
    return <div>404</div>
  }

  if (loading) {
    return <div>Loading {content}…</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (items.length === 0) {
    return <div>No {content} found.</div>
  }

  return (
    <div>
      <h4>{`${content.charAt(0).toUpperCase()}${content.slice(1)}`}</h4>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{renderItem(item)}</li>
        ))}
      </ul>
    </div>
  )
}
