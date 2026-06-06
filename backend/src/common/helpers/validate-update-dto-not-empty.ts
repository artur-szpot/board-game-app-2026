import { BadRequestException } from '@nestjs/common';

export const validateUpdateDtoNotEmpty = (input: object): void => {
  if (Object.keys(input).length === 0) {
    throw new BadRequestException(`Specify at least one field to update`);
  }
};
