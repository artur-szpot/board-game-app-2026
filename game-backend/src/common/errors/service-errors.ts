import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
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

/** Business-rule rejection; the response always carries a message array. */
export class CustomBadRequestError extends BadRequestException {
  constructor(details: string | string[]) {
    const messages = Array.isArray(details) ? details : [details];
    super(messages);
    // HttpException derives a class-name message for array payloads, which reads poorly in logs.
    this.message = messages.join('; ');
  }
}

export class CustomForbiddenError extends ForbiddenException {
  constructor(forbiddenAction: string) {
    super(forbiddenAction);
  }
}

export class CustomConflictError extends ConflictException {
  constructor(conflict: string) {
    super(conflict);
  }
}

export class CustomUnauthorizedError extends UnauthorizedException {
  constructor(reason: string) {
    super(reason);
  }
}
