export enum PermissionLevel {
  READ = 'READ',
  FULL = 'FULL',
}

export const PermissionPrecedence = [
  undefined,
  PermissionLevel.READ,
  PermissionLevel.FULL,
];
