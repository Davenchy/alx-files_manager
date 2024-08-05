import { ObjectId } from 'mongodb';
import redisClient from './redis';
import dbClient from './db';

/**
 * An express middleware that provides `res.json` that responses with a json
 * data in the body of the response.
 * Also sets the `Content-Type` header to `application/json`.
 *
 * prototype `res.json(obj: object, status: number = 200)`
 */
export const jsonResponseMiddleware = (_, res, next) => {
  res.json = (obj, status = 200) => {
    const data = JSON.stringify(obj);
    res.set('Content-Type', 'application/json');
    res.status(status).send(data);
  };

  next();
};

/**
 * An express middleware that provides `res.error` that responses with a json
 * error structure.
 *
 * prototype `res.error(error: string, status: number = 400)`
 *
 * Example error object: `{ "error": "error message..." }`
 */
export const errorResponseMiddleware = (_, res, next) => {
  res.error = (error, status = 400) => res.json({ error }, status);
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
