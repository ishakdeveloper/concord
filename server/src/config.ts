import dotenvSafe from 'dotenv-safe';
import path from 'path';

const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

dotenvSafe.config({
  allowEmptyValues: true,
  path: path.join(__dirname, '../', envFile),
  example: path.join(__dirname, '../.env.example'),
});
