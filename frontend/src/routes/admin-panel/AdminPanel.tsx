import type React from "react";
import type { EntityPanelTab } from "../entity-panel/entity-panel-types";
import { EntityPanel } from "../entity-panel/EntityPanel";

import { AdminDataType } from "./admin-data-type.enum";
import type {
    AdminPanelDetailsByType,
    AdminPanelItem,
    AdminPanelProps,
} from "./admin-types";

const ADMIN_TABS: EntityPanelTab<AdminDataType, AdminPanelItem>[] = [
  { category: AdminDataType.PERMISSION, routeSegment: "permissions" },
  { category: AdminDataType.ROLE, routeSegment: "roles" },
  { category: AdminDataType.USER, routeSegment: "users" },
];

const mapAdminItemsFromResponse = (data: {
  results: { detail?: AdminPanelDetailsByType[AdminDataType] }[];
}): AdminPanelItem[] => {
  return data.results.flatMap(result =>
    result.detail ? [result.detail as AdminPanelItem] : [],
  );
};

export const AdminPanel: React.FC<AdminPanelProps> = (
  props: AdminPanelProps,
) => {
  const { content } = props;

  return (
    <EntityPanel<AdminDataType, AdminPanelItem, AdminPanelDetailsByType>
      title="Admin panel"
      basePath="/admin"
      searchEndpoint="admin/search"
      tabs={ADMIN_TABS}
      content={content}
      includeDetail
      getItemsFromResponse={mapAdminItemsFromResponse}
      fetchErrorMessage="Unable to load admin items"
    />
  );
};
