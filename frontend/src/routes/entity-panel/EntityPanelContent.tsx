import type { EntityPanelTab } from "./entity-panel-types"

type EntityPanelContentProps<Category extends string, Item> = {
  tab?: EntityPanelTab<Category>
  items: Item[]
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

const renderItem = (item: unknown) => {
  const itemRecord = item as Record<string, unknown>
  const keys = Object.keys(itemRecord)
  if (keys.length === 0) {
    return <span>{JSON.stringify(item)}</span>
  }

  return (
    <div className="entity-panel-item">
      {keys.map(key => (
        <div key={key}>
          <strong>{key}</strong>: {renderValue(itemRecord[key])}
        </div>
      ))}
    </div>
  )
}

export const EntityPanelContent = <Category extends string, Item>({
  tab,
  items,
  loading,
  error,
}: EntityPanelContentProps<Category, Item>) => {
  if (!tab) {
    return <div>404</div>
  }

  const typeLabel = (tab.label ?? tab.category).toLowerCase()

  if (loading) {
    return <div>Loading {typeLabel}...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (items.length === 0) {
    return <div>No {typeLabel} found.</div>
  }

  return (
    <div>
      <h4>{tab.label ?? tab.category}</h4>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{renderItem(item)}</li>
        ))}
      </ul>
    </div>
  )
}
