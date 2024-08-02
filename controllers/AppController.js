import redisClient from '../utils/redis';
// import dbClient from '../utils/db';

function status(request, response) {
  const data = {
    redis: redisClient.isAlive(),
    // db: dbClient.isAlive(),
  };
  response.statusCode = 200;
  response.end(JSON.stringify(data));
}

async function stats(request, response) {
  const data = {
    // users: await dbClient.nbUsers(),
    // files: await dbClient.nbFiles(),
  };
  response.statusCode = 200;
  response.end(JSON.stringify(data));
}

export { status, stats };
