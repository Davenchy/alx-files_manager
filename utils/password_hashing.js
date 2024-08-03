import crypto from 'crypto';

/**
 * hash a password using SHA1 hashing algorithm.
 * @param password {string} the password to hash
 * @returns {string} hashed password
 */
export const hashPassword = (password) => {
  const sha1 = crypto.createHash('sha1');
  sha1.update(password);
  return sha1.digest('hex');
};

/**
 * validate if a password is correct and matches the hashed password
 * @param password {string} the password to validate
 * @param hashedPassword {string} the actual hashed password to compare with
 * @returns {boolean} true if password is valid and false otherwise
 */
export const validatePassword = (password, hashedPassword) => {
  const hashed = hashPassword(password);
  return hashed === hashedPassword;
};
