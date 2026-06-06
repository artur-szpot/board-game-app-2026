import { Logger } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { NonEmptyString } from 'io-ts-types';
import { PathReporter } from 'io-ts/PathReporter';

import { Entity, EntityProps } from '@common/Entity';
import { IncorrectEntityProps } from '@common/errors/incorrect-entity-props.error';

import { PermissionLevel } from '../enums/permission-level.enum';
import { PermissionType } from '../enums/permission-type.enum';

export const PermissionProps = t.intersection([
  EntityProps,
  t.type(
    {
      description: NonEmptyString,
      permissionType: t.union([
        t.literal(PermissionType.TODOS),
        t.literal(PermissionType.USERS),
        t.literal(PermissionType.ROLES),
        t.literal(PermissionType.PERMISSIONS),
      ]),
    },
    'requiredPermissionProps',
  ),
  t.partial(
    {
      permissionLevel: t.union([
        t.literal(PermissionLevel.READ),
        t.literal(PermissionLevel.CREATE),
        t.literal(PermissionLevel.FULL),
      ]),
    },
    'optionalPermissionProps',
  ),
]);

export type PermissionPropsType = t.TypeOf<typeof PermissionProps>;

export class Permission extends Entity<PermissionPropsType> {
  protected validateProps(logger: Logger, input: unknown): PermissionPropsType {
    const decoded = PermissionProps.decode(input);
    if (isLeft(decoded)) {
      logger.error(`Incorrect props received: ${JSON.stringify(input)}`);
      throw new IncorrectEntityProps(PathReporter.report(decoded).join('\n'));
    }
    const decodeProps: PermissionPropsType = decoded.right;
    return decodeProps;
  }

  public toString(): string {
    if (this.props.permissionLevel) {
      return `Permission type: ${this.props.permissionType}, level: ${this.props.permissionLevel}`;
    }
    return `Permission type: ${this.props.permissionType}`;
  }
}
