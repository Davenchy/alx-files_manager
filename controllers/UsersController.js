import { ObjectId } from 'mongodb';
import { hashPassword } from '../utils/password_hashing';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

/**
 * A controller for the users endpoints
 */
class UsersController {
  /**
   * A route controller to add a new user
   */
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.error('Missing email');
    }

    if (!password) {
      return res.error('Missing password');
    }

    // check if a user with the same email is already exist
    const foundUser = await dbClient.users.findOne({ email });
    if (foundUser) {
      return res.error('Already exist');
    }

    const hashedPassword = hashPassword(password);

    const results = await dbClient.users.insertOne({
      email,
      password: hashedPassword,
    });

    const user = results.ops[0];
    return res.json({ id: user._id, email: user.email }, 201);
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.json({ error: 'Unauthorized' }, 401);
    }

    const user = await dbClient.users.findOne({ _id: new ObjectId(userId) });

    console.log(user);

    return res.json({ id: user._id, email: user.email });
  }
}

export default UsersController;
