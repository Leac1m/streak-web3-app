export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFound = (message = 'Resource not found') => new ApiError(404, message);
export const badRequest = (message = 'Bad request', details) => new ApiError(400, message, details);
export const unauthorized = (message = 'Unauthorized') => new ApiError(401, message);
export const forbidden = (message = 'Forbidden') => new ApiError(403, message);
export const internal = (message = 'Internal server error') => new ApiError(500, message);