import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class AppController {
  static getStatus(request, response) {
    const data = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };
    response.statusCode = 200;
    response.json(data);
    response.end();
  }

  static async getStats(request, response) {
    const data = {
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
    };
    response.statusCode = 200;
    response.json(data);
    response.end();
  }
}
