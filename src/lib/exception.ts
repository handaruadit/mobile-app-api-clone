import { Response } from 'express';
import { isNumber } from 'lodash';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

import { ErrorCodes, ValidationErrorCodes } from './enum';

class Exception {
  formatReturnedError(code = 'ServerError', payload: any) {
    return {
      error: {
        code,
        payload
      }
    };
  }

  parseError(
    res: Response,
    error: Error | number | unknown,
    code = 'ServerError',
    payload?: Record<string, any>
  ) {
    if (error instanceof MongooseError.ValidationError) {
      const errors: ValidationErrorCodes[] = Object.values(error.errors).map(
        (error: any) => error.message
      );
      this.notValid(res, ErrorCodes.VALIDATION_ERROR, errors);
      return;
    }
    if ((error as MongoServerError)?.code === 11000) {
      this.conflict(res, ErrorCodes.DUPLICATE_KEY_ERROR, (error as MongoServerError).keyValue);
      return;
    }

    if (isNumber(error) && error === 404) {
      this.notFound(res, code, payload);
      return;
    }

    if (error instanceof Error && error.name === 'DocumentNotFoundError') {
      this.notFound(res, code, payload);
      return;
    }

    this.serverError(res, code, payload, error);
  }

  unauthorized(
    res: Response,
    code = 'Unauthorized',
    payload?: Record<string, any>
  ) {
    res.status(401).json({ error: { code, payload } });
  }

  forbidden(res: Response, code = 'Forbidden', payload?: Record<string, any>) {
    res.status(403).json(this.formatReturnedError(code, payload));
  }

  noContent(res: Response) {
    res.status(204);
  }

  conflict(res: Response, code = 'Conflict', payload?: Record<string, any>) {
    console.log('should here', this.formatReturnedError(code, payload))
    res.status(409).json(this.formatReturnedError(code, payload));
  }

  notValid(res: Response, code = 'NotValid', payload?: Record<string, any>) {
    res.status(400).json(this.formatReturnedError(code, payload));
  }

  notFound(res: Response, code = 'NotFound', payload?: Record<string, any>) {
    res.status(404).json(this.formatReturnedError(code, payload));
  }

  empty(res: Response) {
    res.status(204);
  }

  serverError(
    res: Response,
    code = 'ServerError',
    payload?: Record<string, any>,
    error?: Error | number | unknown
  ) {
    console.log(error);
    res.status(500).json(this.formatReturnedError(code, payload));
  }
}

const exception = new Exception();
export default exception;
