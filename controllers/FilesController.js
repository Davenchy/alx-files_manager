import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import { writeFileToDisk } from '../utils/disk';

export const fileTypes = ['folder', 'file', 'image'];

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
      isPiclic: isPublic || false,
      parentId: parentId || 0,
    };

    if (type === 'file') {
      // write file to dist and store the absolute path
      documentData.localPath = writeFileToDisk(data);
    }

    // store document to DB
    const document = (await dbClient.files.insertOne(documentData)).ops[0];

    // format response: rename _id to id and delete localPath
    document.id = document._id;
    delete document._id;

    // send document data
    return res.send(document);
  }
}
