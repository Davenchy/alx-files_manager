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
