import jwt, { SignOptions } from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  const expiresIn = (process.env.JWT_EXPIRE || '7d') as string;
  const options: SignOptions = {
    expiresIn,
  };
  
  return jwt.sign({ id }, secret, options);
};
