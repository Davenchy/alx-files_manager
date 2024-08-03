import redisClient from '../utils/redis';
import dbClient from '../utils/db';

function getStatus(request, response) {
  const data = {
    redis: redisClient.isAlive(),
    db: dbClient.isAlive(),
  };
  response.statusCode = 200;
  response.json(data);
  response.end();
}

async function getStats(request, response) {
  const data = {
    users: await dbClient.nbUsers(),
    files: await dbClient.nbFiles(),
  };
  response.statusCode = 200;
  response.json(data);
  response.end();
}

export { getStatus, getStats };
