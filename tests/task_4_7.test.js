import chai from 'chai';
import chaiHttp from 'chai-http';

import { v4 as uuidv4 } from 'uuid';

import MongoClient from 'mongodb';
import { promisify } from 'util';
import redis from 'redis';
import sha1 from 'sha1';

chai.use(chaiHttp);

describe('GET /users/me', () => {
  let testClientDb;
  let testRedisClient;
  let redisDelAsync;
  let redisGetAsync;
  let redisSetAsync;
  let redisKeysAsync;

  let initialUser = null;
  let initialUserId = null;
  let initialUserToken = null;

  const fctRandomString = () => {
    return Math.random().toString(36).substring(2, 15);
  };
  const fctRemoveAllRedisKeys = async () => {
    const keys = await redisKeysAsync('auth_*');
    keys.forEach(async (key) => {
      await redisDelAsync(key);
    });
  };

  beforeEach(() => {
    const dbInfo = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '27017',
      database: process.env.DB_DATABASE || 'files_manager',
    };
    return new Promise((resolve) => {
      MongoClient.connect(
        `mongodb://${dbInfo.host}:${dbInfo.port}/${dbInfo.database}`,
        async (err, client) => {
          testClientDb = client.db(dbInfo.database);

          await testClientDb.collection('users').deleteMany({});

          // Add 1 user
          initialUser = {
            email: `${fctRandomString()}@me.com`,
            password: sha1(fctRandomString()),
          };
          const createdDocs = await testClientDb
            .collection('users')
            .insertOne(initialUser);
          if (createdDocs && createdDocs.ops.length > 0) {
            initialUserId = createdDocs.ops[0]._id.toString();
          }

          testRedisClient = redis.createClient();
          redisDelAsync = promisify(testRedisClient.del).bind(testRedisClient);
          redisGetAsync = promisify(testRedisClient.get).bind(testRedisClient);
          redisSetAsync = promisify(testRedisClient.set).bind(testRedisClient);
          redisKeysAsync = promisify(testRedisClient.keys).bind(
            testRedisClient,
          );
          testRedisClient.on('connect', async () => {
            fctRemoveAllRedisKeys();

            // Set token for this user
            initialUserToken = uuidv4();
            await redisSetAsync(`auth_${initialUserToken}`, initialUserId);
            resolve();
          });
        },
      );
    });
  });

  afterEach(() => {
    fctRemoveAllRedisKeys();
  });

  it('GET /users/me with incorrect token', (done) => {
    chai
      .request('http://localhost:5000')
      .get('/users/me')
      .set('X-Token', 'nope')
      .end(async (err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(401);

        const resError = res.body.error;
        chai.expect(resError).to.equal('Unauthorized');

        done();
      });
  }).timeout(30000);
});
