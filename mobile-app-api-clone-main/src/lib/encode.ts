import bcrypt from 'bcrypt';
import { customAlphabet } from 'nanoid';

export const encryptPassword = async (data = ''): Promise<string> => {
  const encrypted = await bcrypt.hash(data, 10);
  return encrypted;
};

export const comparePassword = async ({ password, encryptedPassword = '' }: { password: string; encryptedPassword?: string }): Promise<boolean> => {
  return await bcrypt.compare(password, encryptedPassword);
};

export const randomToken = (length = 32) => {
  const nanoid = customAlphabet('1234567890abcdef', length);
  return nanoid();
};
