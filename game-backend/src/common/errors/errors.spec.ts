import { BadRequestException, HttpStatus } from '@nestjs/common';

import { BadRequestShapeFilter } from './bad-request-shape.filter';
import { CustomBadRequestError, CustomForbiddenError } from './service-errors';

const buildHost = (url = '/game-api/tags') => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return {
    host: {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ url }),
      }),
    } as never,
    status,
    json,
  };
};

describe('CustomBadRequestError', () => {
  it('always reports an array of messages', () => {
    const error = new CustomBadRequestError('Tag name is already in use');

    expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(error.getResponse()).toEqual(
      expect.objectContaining({ message: ['Tag name is already in use'] }),
    );
  });

  it('keeps a readable error message for logs', () => {
    const error = new CustomBadRequestError(['first', 'second']);

    expect(error.message).toBe('first; second');
    expect(error.getResponse()).toEqual(
      expect.objectContaining({ message: ['first', 'second'] }),
    );
  });
});

describe('BadRequestShapeFilter', () => {
  it('normalizes a single-message Bad Request into the documented shape', () => {
    const { host, status, json } = buildHost();

    new BadRequestShapeFilter().catch(
      new BadRequestException('Location cannot be its own parent'),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['Location cannot be its own parent'],
        error: 'Bad Request',
        path: '/game-api/tags',
        timestamp: expect.any(String),
      }),
    );
  });

  it('keeps an existing message array', () => {
    const { host, json } = buildHost();

    new BadRequestShapeFilter().catch(
      new CustomBadRequestError(['first', 'second']),
      host,
    );

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: ['first', 'second'] }),
    );
  });

  it('passes other statuses through untouched', () => {
    const { host, status, json } = buildHost();
    const forbidden = new CustomForbiddenError('not allowed');

    new BadRequestShapeFilter().catch(forbidden, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(json).toHaveBeenCalledWith(forbidden.getResponse());
  });
});
