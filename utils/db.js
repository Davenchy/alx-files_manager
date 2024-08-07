import { MongoClient } from 'mongodb';
import { DB_HOST, DB_PORT, DB_NAME } from './constants';

class DBClient {
  /**
   * Create a new db client, use `isAlive` to check if db is alive.
   *
   * @constructor
   * @param {string} host - uses **DB_HOST** env var if not provided or `localhost`
   * by default
   * @param {number} port - uses **DB_PORT** env var if not provided or `27017`
   * @param {string} database - uses **DB_NAME** env var if not provided or `files_manager`
   */
  constructor(host, port, database) {
    this.host = host || DB_HOST;
    this.port = port || DB_PORT;
    this.database = database || DB_NAME;

    MongoClient.connect(
      `mongodb://${this.host}:${this.port}`,
      (err, client) => {
        if (!err) {
          this.client = client;
          this.db = client.db(this.database);
          this.users = this.db.collection('users');
          this.files = this.db.collection('files');
        }
      },
    );
  }

  /**
   * @returns {boolean} true if client connection to db is successful otherwise false
   */
  isAlive() {
    return !!this.client && !!this.db && this.client.isConnected();
  }

  /**
   * @returns {number} the number of users created.
   */
  async nbUsers() {
    return this.users.countDocuments();
  }

  /**
   * @returns {number} the number of files stored.
   */
  async nbFiles() {
    return this.files.countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
