import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * A constant that holds the root path to store files.
 * @constant
 * @type {string}
 * @default
 */
export const ROOT_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

/**
 * Decodes the base64 file content and writes it to the disk.
 *
 * It generates a unique file name using **crypto.randomUUID** function.
 * And stores it to `{rootPath}/{randomUUIDName}`.
 *
 * If rootPath is not exists it will create it.
 *
 * @param {string} base64FileContent - The base64 file content.
 * @param {string} [rootPath=ROOT_PATH] - The root path to write files under,
 * if not set it will use the **ROOT_PATH**.
 *
 * @returns {string} The full file path.
 */
export function writeFileToDisk(base64FileContent, rootPath = ROOT_PATH) {
  // Create root path if not exists
  if (!existsSync(rootPath)) {
    mkdirSync(rootPath);
  }

  // generate file name
  const fileName = randomUUID();
  // generate file path
  const fileFullPath = join(rootPath, fileName);

  // decode the file data from base64
  const fileContentBuf = Buffer.from(base64FileContent, 'base64');
  const writeStream = createWriteStream(fileFullPath);
  const stream = new Readable();

  stream.push(fileContentBuf);
  stream.push(null);
  stream.pipe(writeStream);

  return fileFullPath;
}
