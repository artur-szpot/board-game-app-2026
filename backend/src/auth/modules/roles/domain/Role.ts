import { Logger } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { nonEmptyArray, NonEmptyString } from 'io-ts-types';
import { PathReporter } from 'io-ts/PathReporter';

import {
  Permission,
  PermissionProps,
} from '@auth/modules/permissions/domain/Permission';
import { Entity, EntityProps } from '@common/Entity';
import { IncorrectEntityProps } from '@common/errors/incorrect-entity-props.error';

export const RoleProps = t.intersection([
  EntityProps,
  t.type(
    {
      name: NonEmptyString,
      description: NonEmptyString,
      permissions: nonEmptyArray(PermissionProps),
      protectedRole: t.boolean,
    },
    'requiredRoleProps',
  ),
]);

export type RolePropsInputType = t.TypeOf<typeof RoleProps>;

export type RolePropsType = Omit<RolePropsInputType, 'permissions'> & {
  permissions: Permission[];
};

export class Role extends Entity<RolePropsType> {
  protected validateProps(logger: Logger, input: unknown): RolePropsType {
    const decoded = RoleProps.decode(input);
    if (isLeft(decoded)) {
      logger.error(`Incorrect props received: ${JSON.stringify(input)}`);
      throw new IncorrectEntityProps(PathReporter.report(decoded).join('\n'));
    }
    const decodedProps: RolePropsInputType = decoded.right;
    return {
      ...decodedProps,
      permissions: decodedProps.permissions.map(
        (permission) => new Permission(logger, permission),
      ),
    };
  }

  public toString(): string {
    return `Role "${this.props.name}"`;
  }
}
