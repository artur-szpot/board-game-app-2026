import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

const isNonEmptyString = (value: unknown): boolean =>
  typeof value === 'string' && value.trim().length > 0;

@ValidatorConstraint({ name: 'rowNameRequiredWithoutIcon', async: false })
export class RowNameRequiredWithoutIconValidator implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const row = args.object as { name?: unknown; icon?: unknown };
    return isNonEmptyString(row.name) || isNonEmptyString(row.icon);
  }

  defaultMessage(): string {
    return 'a scoring row requires a name when no icon is provided';
  }
}
