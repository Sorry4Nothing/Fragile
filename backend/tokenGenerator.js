import jsonwebtoken from 'jsonwebtoken';
import fs from 'fs/promises';

export async function generateToken(user) {
const secret = JSON.parse(await fs.readFile('./resources/config.json')).JWTSecret;
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