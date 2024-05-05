import * as path from 'path';
import * as dotenv from 'dotenv';

const envPath: string = path.resolve(__dirname, '../.env.test');

module.exports = async (): Promise<void> => {
  dotenv.config({ path: envPath });
};
