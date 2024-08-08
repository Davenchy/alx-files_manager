// Mongo Database
/**
 * Database host
 * @constant
 * @type {string}
 */
export const DB_HOST = process.env.DB_HOST || 'localhost';

/**
 * Database port
 * @constant
 * @type {string}
 */
export const DB_PORT = process.env.DB_PORT || '27017';

/**
 * Database name
 * @constant
 * @type {string}
 */
export const DB_NAME = process.env.DB_NAME || 'files_manager';

// Redis Database
/**
 * RedisDB host
 * @constant
 * @type {string}
 */
export const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';

/**
 * RedisDB port
 * @constant
 * @type {string}
 */
export const REDIS_PORT = process.env.REDIS_PORT || '6379';

// Disk
/**
 * A constant that holds the root path to store files.
 * @constant
 * @type {string}
 */
export const ROOT_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

// Queue
/**
 * The files queue name
 * @constant
 * @type {string}
 */
export const FILE_QUEUE = 'fileQueue';

// Thumbnails
/**
 * Array of different thumbnail sizes
 * @constant
 * @type {number[]}
 */
export const THUMBNAIL_WIDTH = [500, 250, 100];

// Files
/**
 * Array of file types
 * @constant
 * @type {string[]}
 */
export const FILE_TYPES = ['folder', 'file', 'image'];
