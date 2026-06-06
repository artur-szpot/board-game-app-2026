import { Logger } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { DateFromISOString, nonEmptyArray, NonEmptyString } from 'io-ts-types';
import { PathReporter } from 'io-ts/PathReporter';

import { PermissionDefinition } from '@auth/decorators/permissions.decorator';
import {
  PermissionLevel,
  PermissionPrecedence,
} from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { Role, RoleProps } from '@auth/modules/roles/domain/Role';
import { Entity, EntityProps } from '@common/Entity';
import { IncorrectEntityProps } from '@common/errors/incorrect-entity-props.error';

export const UserProps = t.intersection([
  EntityProps,
  t.partial(
    {
      password: NonEmptyString,
    },
    'optionalUserProps',
  ),
  t.type(
    {
      username: NonEmptyString,
      email: NonEmptyString,
      roles: nonEmptyArray(RoleProps),
      joinedDate: DateFromISOString,
    },
    'requiredUserProps',
  ),
  t.partial(
    {
      lastLogin: DateFromISOString,
    },
    'optionalUserProps',
  ),
]);

export type UserPropsInputType = t.TypeOf<typeof UserProps>;

export type UserPropsType = Omit<UserPropsInputType, 'roles'> & {
  roles: Role[];
};

export class User extends Entity<UserPropsType> {
  protected validateProps(logger: Logger, input: unknown): UserPropsType {
    const decoded = UserProps.decode(input);
    if (isLeft(decoded)) {
      logger.error(`Incorrect props received: ${JSON.stringify(input)}`);
      logger.error(`Incorrect props received: ${typeof input['joinedDate']}`);
      throw new IncorrectEntityProps(PathReporter.report(decoded).join('\n'));
    }
    const decodedProps: UserPropsInputType = decoded.right;
    return {
      ...decodedProps,
      roles: decodedProps.roles.map((role) => new Role(logger, role)),
    };
  }

  public toString(): string {
    return `User "${this.props.username}"`;
  }

  public sanitize(): void {
    const { password, ...sanitizedProps } = this.props;
    this.props = sanitizedProps;
  }

  public getPermissions(): PermissionDefinition[] {
    const result = new Map<PermissionType, PermissionLevel>();
    this.props.roles.forEach((role) => {
      const { permissions } = role.getProps();
      permissions.forEach((permission) => {
        const { permissionType, permissionLevel } = permission.getProps();
        const currentLevel = PermissionPrecedence.indexOf(
          result.get(permissionType),
        );
        const newLevel = PermissionPrecedence.indexOf(permissionLevel);
        if (newLevel > currentLevel) {
          result.set(permissionType, permissionLevel);
        }
      });
    });
    return [...result.entries()];
  }
}
