import { useMemo } from "react";

import {
    PermissionPrecedence,
    type PermissionLevel,
    type PermissionShortDto,
    type PermissionType,
} from "../dto/user-data.dto";
import { selectPermissions } from "../store/features/currentUserSlice";
import { useAppSelector } from "../store/hooks";

type RequiredPermissions = Record<PermissionType, PermissionLevel>;

const getPermissionRank = (permissionLevel?: PermissionLevel): number =>
  PermissionPrecedence.indexOf(permissionLevel);

export const hasRequiredPermissions = (
  permissions: PermissionShortDto[] | undefined,
  requiredPermissions: RequiredPermissions | undefined,
): boolean => {
  if (!requiredPermissions) {
    return true;
  }

  return Object.entries(requiredPermissions).every(
    ([permissionType, requiredLevel]) => {
      const matchingPermission = (permissions ?? []).find(
        permission => permission.permissionType === permissionType,
      );

      if (!matchingPermission?.permissionLevel) {
        return false;
      }

      return (
        getPermissionRank(matchingPermission.permissionLevel) >=
        getPermissionRank(requiredLevel)
      );
    },
  );
};

export const useHasRequiredPermissions = (
  requiredPermissions: RequiredPermissions | undefined,
): boolean => {
  const permissions = useAppSelector(selectPermissions);

  return useMemo(
    () => hasRequiredPermissions(permissions, requiredPermissions),
    [permissions, requiredPermissions],
  );
};
