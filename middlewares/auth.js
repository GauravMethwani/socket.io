const jwt = require('jsonwebtoken');

const secretKey = 'your-secret-key'; // Change this to a secure random key

function generateToken(userId) {
  return jwt.sign({ userId }, secretKey, { expiresIn: '1h' }); // Set token expiration as needed
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
