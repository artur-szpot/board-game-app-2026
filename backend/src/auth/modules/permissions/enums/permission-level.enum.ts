export enum PermissionLevel {
  READ = 'READ',
  CREATE = 'CREATE',
  FULL = 'FULL',
}

export const PermissionPrecedence = [
  undefined,
  PermissionLevel.READ,
  PermissionLevel.CREATE,
  PermissionLevel.FULL,
];
