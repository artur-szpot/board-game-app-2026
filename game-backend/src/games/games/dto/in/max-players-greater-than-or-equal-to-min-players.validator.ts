import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({
  name: 'maxPlayersGreaterThanOrEqualToMinPlayers',
  async: false,
})
export class MaxPlayersGreaterThanOrEqualToMinPlayersValidator implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const object = args.object as { minPlayers?: unknown };
    if (typeof value !== 'number' || typeof object.minPlayers !== 'number') {
      return true;
    }

    return value >= object.minPlayers;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be greater than or equal to minPlayers`;
  }
}
