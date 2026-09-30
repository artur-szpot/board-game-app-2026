import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorBody = {
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
};

/**
 * Guarantees the documented Bad Request shape: business-rule errors thrown with a single
 * string are reported as a one-element message array, like class-validator failures.
 */
@Catch(HttpException)
export class BadRequestShapeFilter implements ExceptionFilter {
  public catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const status = exception.getStatus();

    if (status !== HttpStatus.BAD_REQUEST) {
      response.status(status).json(exception.getResponse());
      return;
    }

    const request = context.getRequest<Request>();
    const payload = exception.getResponse();
    const body: ErrorBody =
      typeof payload === 'string'
        ? { statusCode: status, message: payload, error: 'Bad Request' }
        : (payload as ErrorBody);

    response.status(status).json({
      ...body,
      statusCode: status,
      message: Array.isArray(body.message) ? body.message : [body.message],
      error: body.error ?? 'Bad Request',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
