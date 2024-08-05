import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class AppController {
  static getStatus(_, response) {
    response.send({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }

  static async getStats(_, response) {
    response.send({
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
    });
  }
}
