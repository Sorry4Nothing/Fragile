import jsonwebtoken from 'jsonwebtoken';
import fs from 'fs/promises';

const secret = JSON.parse(await fs.readFile('./resources/config.json')).JWTSecret;

export async function generateToken(user) {
  const token = jsonwebtoken.sign(
    {
      id: user.id,
      username: user.username,
    },
    secret,
    {
      expiresIn: '1d',
    }
  );
  return token;
}

export async function verifyToken(token) {
  try {
    jsonwebtoken.verify(token, secret);
    return true;
  } catch (e) {
    console.error("invalid secret", e);
    return false;
  }
}

