import { drizzle } from 'drizzle-orm/node-postgres';
import { users } from '../shared/schema';
import type { InsertUser, User } from '../shared/schema';

const db = drizzle(process.env.DATABASE_URL!);

export const storage = {
  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where({ username }).limit(1);
    return result[0] || null;
  },

  async insertUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }
};