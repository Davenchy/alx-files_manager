/**
 * An express middleware that provides `res.json` that responses with a json
 * data in the body of the response.
 * Also sets the `Content-Type` header to `application/json`.
 */
export const jsonResponseMiddleware = (_, res, next) => {
  res.json = (obj) => {
    const data = JSON.stringify(obj);
    res.set('Content-Type', 'application/json');
    res.send(data);
  };

  next();
};

/**
 * An express middleware that provides `res.error` that responses with a json
 * error structure.
 *
 * Example: `{ "error": "error message..." }`
 */
export const errorResponseMiddleware = (_, res, next) => {
  res.error = (error) => res.json({ error });
  next();
};
