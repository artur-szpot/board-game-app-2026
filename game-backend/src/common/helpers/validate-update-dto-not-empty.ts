import { CustomBadRequestError } from '@common/errors/service-errors';

export const validateUpdateDtoNotEmpty = (input: object): void => {
  if (Object.keys(input).length === 0) {
    throw new CustomBadRequestError(`Specify at least one field to update`);
  }
};
