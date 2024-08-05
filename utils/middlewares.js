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
const errorResponseMiddleware = (_, res, next) => {
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

export default errorResponseMiddleware;
