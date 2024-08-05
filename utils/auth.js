import dbClient from './db';
import { hashPassword } from './password_hashing';

async function isUserExists(email, password) {
  const hashedPassword = hashPassword(password);
  const user = await dbClient.users.findOne({
    email,
    password: hashedPassword,
  });
  if (!user) {
    return false;
  }
  return user._id.toString();
}

export default isUserExists;
