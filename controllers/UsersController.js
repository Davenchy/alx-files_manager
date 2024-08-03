import { hashPassword } from '../utils/password_hashing';

/**
 * A route controller to add a new user
 */
export function postNew(req, res) {
  const { email, password } = req.body;

  if (!email) {
    return res.error('Missing email');
  }

  if (!password) {
    return res.error('Missing password');
  }

  // !TODO: check if email is already exists

  const hashedPassword = hashPassword(password);

  // !TODO: save the user to the users collection

  // !TODO: return the user as an object of email and db generated id
}
