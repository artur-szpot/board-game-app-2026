import type React from "react"
import type { EntityPanelTab } from "../entity-panel/entity-panel-types"
import { EntityPanel } from "../entity-panel/EntityPanel"

import type { AdminPanelCategory, AdminPanelItem, AdminPanelProps } from "./admin-types"

const ADMIN_TABS: EntityPanelTab<AdminPanelCategory>[] = [
  { category: "permissions", endpoint: "permissions" },
  { category: "roles", endpoint: "roles" },
  { category: "users", endpoint: "users" },
]

export const AdminPanel: React.FC<AdminPanelProps> = (
  props: AdminPanelProps,
) => {
  const { content } = props

  return (
    <EntityPanel<AdminPanelCategory, AdminPanelItem>
      title="Admin panel"
      basePath="/admin"
      tabs={ADMIN_TABS}
      content={content}
      fetchErrorMessage="Unable to load admin items"
    />
  )
}
