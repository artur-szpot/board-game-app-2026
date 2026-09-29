import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'scoreValuesMap', async: false })
export class ScoreValuesMapValidator implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }

    const players = (args.object as { players?: unknown }).players;
    const knownPlayers = Array.isArray(players)
      ? new Set(
          players.filter(
            (player): player is string => typeof player === 'string',
          ),
        )
      : undefined;

    return Object.values(value as Record<string, unknown>).every(
      (perPlayer) => {
        if (
          typeof perPlayer !== 'object' ||
          perPlayer === null ||
          Array.isArray(perPlayer)
        ) {
          return false;
        }

        return Object.entries(perPlayer as Record<string, unknown>).every(
          ([player, score]) =>
            (!knownPlayers || knownPlayers.has(player)) &&
            typeof score === 'number' &&
            Number.isFinite(score),
        );
      },
    );
  }

  defaultMessage(): string {
    return 'values must map row IDs to finite numeric scores keyed by a declared player';
  }
}
