import { randomUUID } from 'crypto';
import redisClient from '../utils/redis';
import isUserExists from '../utils/auth';

export default class AuthController {
  /**
   * Express route controller to login a user.
   *
   * Expects the HTTP Header `Authorization` set to `Basic {CREDENTIALS}`
   *
   * The `CREDENTIALS` is the `email` and `password` both are set in
   * the form `{email}:{password}`, and encoded in base64.
   *
   * This controller will respond with JSON object contains the key `token` on
   * success.
   *
   * On any route that requires authentication, send the request with the HTTP
   * Header `X-Token` set to `token`.
   */
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.sendError('Unauthorized', 401);
    }

    const base64String = authHeader.split(' ')[1];
    const decodedString = Buffer.from(base64String, 'base64').toString('utf-8');
    const [userEmail, userPassword] = decodedString.split(':');

    if (!userEmail || !userPassword) {
      return res.sendError('Unauthorized', 401);
    }

    const userId = await isUserExists(userEmail, userPassword);
    if (!userId) {
      return res.sendError('Unauthorized', 401);
    }

    const authToken = randomUUID();

    // make a session for this user with expiration date 24 hours
    redisClient.set(`auth_${authToken}`, userId, 24 * 60 * 60);

    return res.send({ token: authToken });
  }

  static async getDisconnect(req, res) {
    const { token } = req;

    redisClient.del(`auth_${token}`);

    return res.status(204).send();
  }
}
