import { ObjectId } from 'mongodb';
import redisClient from './redis';
import dbClient from './db';

/**
 * An express middleware that provides `res.sendError` function that responses
 * with an error structure.
 *
 * Usage:
 * ```ts
 * res.sendError(error: string);
 * res.sendError(error: string, status: number);
 * res.sendError(error: string, payload: object);
 * res.sendError(error: string, payload: object, status: number);
 * ```
 *
 * By default the **status** is `400` and the **payload** is `{}`.
 *
 * The error structure object:
 * ```json
 * {
 *   "error": "error message...",
 *   ...optional payload
 * }```
 */
export const errorResponseMiddleware = (_, res, next) => {
  res.sendError = (errorMessage, optA, optB) => {
    let status = 400;
    let payload = {};

    if (optA) {
      if (typeof optA === 'number') {
        status = optA;
      } else if (typeof optA === 'object') {
        payload = optA;

        if (optB && typeof optB === 'number') {
          status = optB;
        }
      }
    }

    res.status(status).send({ error: errorMessage, ...payload });
  };

  next();
};

/**
 * An express middleware that checks guards protected routes.
 *
 * If user is not authorized responds with 401 status code error message.
 *
 * If user is authorized, provides the following:
 *   - **req.user**: The user object of data.
 *   - **req.userId**: the user id.
 *   - **req.token**": the user token.
 */
export const AuthGuard = async (req, res, next) => {
  const token = req.headers['x-token'];
  const userId = await redisClient.get(`auth_${token}`);

  if (!userId) {
    return res.sendError('Unauthorized', 401);
  }

  const user = await dbClient.users.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    return res.sendError('Unauthorized', 401);
  }

  req.user = user;
  req.userId = userId;
  req.token = token;

  return next();
};

/**
 * An express middleware that checks if the file exists and belongs to the user.
 *
 * Uses `req.params.id` as the file id.
 *
 * > Make sure to add after `AuthGuard` middleware or it will throw an error.
 *
 * It provides:
 *   - **document**: The file document.
 *   - **documentId**: The file id.
 *
 */
export const FileLoader = async (req, res, next) => {
  const { userId } = req;
  const fileId = req.params.id;

  if (!userId) {
    throw new Error('Use AuthGuard middleware first');
  }

  const document = await dbClient.files.findOne({
    _id: new ObjectId(fileId),
    userId: new ObjectId(userId),
  });

  if (!document) {
    return res.sendError('Not found', 404);
  }

  req.document = document;
  req.documentId = fileId;

  return next();
};
// eslint-disable-next-line no-multiple-empty-lines

