import Joi from 'joi';
import { badRequest } from '../utils/ApiError.js';

// Factory: pass an object with schemas for body/query/params
export const validate = (schemas) => (req, _res, next) => {
  try {
    const sources = ['body', 'query', 'params'];
    for (const src of sources) {
      if (schemas[src]) {
        const { error, value } = schemas[src].validate(req[src], { abortEarly: false, stripUnknown: true });
        if (error) {
          throw badRequest('Validation failed', error.details.map(d => ({ message: d.message, path: d.path })));
        }
        req[src] = value; // sanitized
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Common reusable patterns/schemas
export const schemas = {
  walletAddress: Joi.string().min(5).max(150).required(),
  signature: Joi.string().min(10).required(),
  nonce: Joi.string().min(10).required(),
  leaderboardLimit: Joi.number().integer().min(1).max(100).default(20)
};
