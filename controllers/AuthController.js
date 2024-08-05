import { randomUUID } from 'crypto';
import redisClient from '../utils/redis';
import isUserExists from '../utils/auth';

export default class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.sendError('Unauthorized', 401);
    }

    const base64String = authHeader.split(' ')[1];
    const decodedString = Buffer.from(base64String, 'base64').toString('utf-8');
    const [userEmail, userPassword] = decodedString.split(':');

    const userId = await isUserExists(userEmail, userPassword);

    if (!userId) {
      return res.sendError('Unauthorized', 401);
    }

    const authToken = randomUUID();

    // make a session for this user with expiration date 24 hours
    redisClient.set(`auth_${authToken}`, userId, 24 * 60 * 60);

    return res.send({ token: authToken });
  }

  static async disConnect(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.sendError('Unauthorized', 401);
    }

    redisClient.del(`auth_${token}`);

    return res.status(204).send();
  }
}
