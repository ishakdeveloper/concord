import { DbUser } from '../database/schema/users';

declare global {
  namespace Express {
    interface User extends DbUser {}
  }
}
