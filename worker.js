import BullQueue from 'bull';
import imageThumbnail from 'image-thumbnail';
import { createReadStream, createWriteStream, ReadStream } from 'fs';
import { ObjectId } from 'mongodb';
import dbClient from './utils/db';
import { THUMBNAIL_WIDTH } from './utils/constants';

const fileQueue = new BullQueue('fileQueue');

/**
 * Generate thumbnail file of `width` from the image file at `filePath`.
 *
 * The new generated thumbnail file will be stored at `filePath` with `_{width}`
 * suffix.
 *
 * e.g. `.../myImageFile` => `.../myImageFile_100`
 *
 * @param {string} filePath - the path of the image file
 * @param {string} width - the width of the thumbnail
 * @returns {Promise<void>}
 */
const generateThumbnails = async (filePath, width) => {
  const fileReader = createReadStream(filePath);
  const fileWriter = createWriteStream(`${filePath}_${width}`);

  const thumbnail = await imageThumbnail(fileReader, {
    width,
  });

  const reader = new ReadStream();
  reader.push(thumbnail);
  reader.push(null);
  reader.pipe(fileWriter);
};

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.files.findOne({
    _id: new ObjectId(fileId),
    userId: new ObjectId(userId),
  });

  if (!file) {
    throw new Error('File not found');
  }

  THUMBNAIL_WIDTH.forEach((width) => generateThumbnails(file.localPath, width));
});
