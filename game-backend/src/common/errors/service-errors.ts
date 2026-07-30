import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export class CustomInternalError extends InternalServerErrorException {
  constructor(failedOperation: string) {
    super(`Unexpected error occurred while ${failedOperation}`);
  }
}

export class CustomNotFoundError extends NotFoundException {
  constructor(missingAsset: string) {
    super(`Could not find ${missingAsset}`);
  }
}
