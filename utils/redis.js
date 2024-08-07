import { createClient } from 'redis';
import { promisify } from 'util';
import { REDIS_HOST, REDIS_PORT } from './constants';

class RedisClient {
  constructor() {
    this.client = createClient({
      host: REDIS_HOST,
      port: REDIS_PORT,
    });

    this.client.on('error', (error) => {
      console.log(`Error occured: ${error.message}`);
    });

    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setexAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return this.getAsync(key);
  }

  async set(key, value, duration) {
    return this.setexAsync(key, duration, value);
  }

  async del(key) {
    return this.delAsync(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
