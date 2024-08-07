import { existsSync } from 'fs';
import BullQueue from 'bull';
import mime from 'mime-types';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import DiskUtils from '../utils/disk';
import { THUMBNAIL_WIDTH, FILE_TYPES } from '../utils/constants';

const thumbnailsQueue = new BullQueue('thumbnails');

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
      thumbnailsQueue.add({
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
    const { document: file } = req;
    const { size } = req.query;

    if (!file.isPublic) {
      return res.sendError('Not found', 404);
    }

    if (file.type === 'folder') {
      return res.sendError("A folder doesn't have content");
    }

    if (!file.localPath) {
      return res.sendError('Not found', 404);
    }

    // set file path also support thumbnails if size is provided
    let filePath = file.localPath;
    if (size && THUMBNAIL_WIDTH.indexOf(size.toString()) !== -1) {
      filePath = `${filePath}_${size}`;
    }

    // make sure file is exist on disk before sending
    if (!existsSync(filePath)) {
      return res.sendError('Not found', 404);
    }

    // detect and set content type
    const mimeType = mime.lookup(file.name);
    res.setHeader('Content-Type', mimeType);

    // send file content
    return res.sendFile(filePath);
  }
}
