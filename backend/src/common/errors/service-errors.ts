import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export class InternalError extends InternalServerErrorException {
  constructor(failedOperation: string) {
    super(`Unexpected error occurred while ${failedOperation}`);
  }
}

export class NotFoundError extends NotFoundException {
  constructor(missingAsset: string) {
    super(`Could not find ${missingAsset}`);
  }
}
