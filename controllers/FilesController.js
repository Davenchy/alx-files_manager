import { existsSync } from 'fs';
import BullQueue from 'bull';
import mime from 'mime-types';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import DiskUtils from '../utils/disk';
import { THUMBNAIL_WIDTH, FILE_TYPES, FILE_QUEUE } from '../utils/constants';

const fileQueue = new BullQueue(FILE_QUEUE);

export const serializeFileDocument = (document) => {
  // eslint-disable-next-line object-curly-newline
  const { name, userId, type, isPublic, parentId } = document;
  // eslint-disable-next-line object-curly-newline
  return { id: document._id, userId, name, type, isPublic, parentId };
};

export default class FilesController {
  static async postUpload(req, res) {
    // eslint-disable-next-line object-curly-newline
    const { name, type, parentId, isPublic, data } = req.body;

    if (!name) {
      return res.sendError('Missing name');
    }

    if (!type || FILE_TYPES.indexOf(type) === -1) {
      return res.sendError('Missing type');
    }

    if (!data && type !== 'folder') {
      return res.sendError('Missing data');
    }

    if (parentId) {
      const file = await dbClient.files.findOne({
        _id: new ObjectId(parentId),
      });

      if (!file) {
        return res.sendError('Parent not found');
      }

      if (file.type !== 'folder') {
        return res.sendError('Parent is not folder');
      }
    }

    // General document data
    const documentData = {
      userId: new ObjectId(req.userId),
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
    };

    if (type !== 'folder') {
      // write the file to the disk and store the absolute path
      documentData.localPath = DiskUtils.writeFileToDisk(data);
    }

    // store document to DB
    const document = (await dbClient.files.insertOne(documentData)).ops[0];

    // generate thumbnails for images
    if (type === 'image') {
      fileQueue.add({
        userId: req.userId,
        fileId: document._id.toString(),
      });
    }

    // send document data
    return res.send(serializeFileDocument(document));
  }

  static getShow(req, res) {
    return res.send(serializeFileDocument(req.document));
  }

  static async getIndex(req, res) {
    const { userId } = req;
    const parentId = req.query.parentId || 0;
    const page = parseInt(req.query.page, 10) || 0;
    const limit = 20;

    const documents = await dbClient.files
      .aggregate([
        { $match: { userId: new ObjectId(userId), parentId } },
        { $skip: limit * page },
        { $limit: limit },
      ])
      .toArray();

    res.send(documents.map((doc) => serializeFileDocument(doc)));
  }

  static async putPublish(req, res) {
    await dbClient.files.updateOne(
      { _id: new ObjectId(req.documentId) },
      { $set: { isPublic: true } },
    );

    res.send(serializeFileDocument({ ...req.document, isPublic: true }));
  }

  static async putUnpublish(req, res) {
    await dbClient.files.updateOne(
      { _id: new ObjectId(req.documentId) },
      { $set: { isPublic: false } },
    );

    res.send(serializeFileDocument({ ...req.document, isPublic: false }));
  }

  static async getFile(req, res) {
    // Autherize user
    const token = req.headers['x-token'];
    const userId = (await redisClient.get(`auth_${token}`)) || undefined;
    const { size } = req.query;

    // make sure X-Token header is set and user session is alive
    if (!token || !userId) {
      return res.sendError('Not found', 404);
    }

    // make sure the user account exists
    const user = await dbClient.users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.sendError('Not found', 404);
    }

    const file = await dbClient.files.findOne({
      _id: new ObjectId(req.params.id),
      userId: new ObjectId(userId),
    });

    // make sure the file exists, owned by the user, and is public
    if (!file || !file.isPublic) {
      return res.sendError('Not found', 404);
    }

    // make sure the document is not of type folder
    if (file.type === 'folder') {
      return res.sendError("A folder doesn't have content");
    }

    // make sure the localPath field is set
    if (!file.localPath) {
      return res.sendError('Not found', 404);
    }

    // set file path also support thumbnails if size is provided
    let filePath = file.localPath;
    if (size && THUMBNAIL_WIDTH.indexOf(Number.parseInt(size)) !== -1) {
      filePath = `${filePath}_${size}`;
    }

    // make sure file is exist on disk before sending
    if (!existsSync(filePath)) {
      return res.sendError('Not found', 404);
    }

    console.log('downloading file:', filePath);

    // detect and set content type
    const mimeType = mime.lookup(file.name);
    res.setHeader('Content-Type', mimeType);

    // send file content
    return res.sendFile(filePath);
  }
}
