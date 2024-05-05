import { customAlphabet } from 'nanoid';

const alphabet = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  10,
);

const generateUrlPath = (): string => {
  return alphabet();
};

export default {
  generateUrlPath,
};
