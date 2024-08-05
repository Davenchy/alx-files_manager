import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import { writeFileToDisk } from '../utils/disk';

export const fileTypes = ['folder', 'file', 'image'];

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

    if (!type || fileTypes.indexOf(type) === -1) {
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

    if (type === 'file') {
      // write file to dist and store the absolute path
      documentData.localPath = writeFileToDisk(data);
    }

    // store document to DB
    const document = (await dbClient.files.insertOne(documentData)).ops[0];

    // send document data
    return res.send(serializeFileDocument(document));
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
}
