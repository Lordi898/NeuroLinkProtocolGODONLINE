import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and } from "drizzle-orm";
import { type User, type InsertUser, users, userProfiles, type UserProfile, type InsertUserProfile, matches, matchPlayers, friends, type Match, type MatchPlayer, type Friend } from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profiles
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<Omit<UserProfile, 'id' | 'userId'>>): Promise<UserProfile>;
  
  // Matches
  createMatch(match: any): Promise<Match>;
  addMatchPlayer(player: any): Promise<MatchPlayer>;
  getUserMatches(userId: string, limit?: number): Promise<Match[]>;
  
  // Leaderboard
  getLeaderboardByWins(limit?: number): Promise<any[]>;
  getLeaderboardByImpostorWins(limit?: number): Promise<any[]>;
  
  // Friends
  addFriend(userId: string, friendId: string): Promise<Friend>;
  removeFriend(userId: string, friendId: string): Promise<void>;
  getFriends(userId: string): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    return result[0];
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const result = await db.insert(userProfiles).values(profile).returning();
    return result[0];
  }

  async updateUserProfile(userId: string, profile: Partial<Omit<UserProfile, 'id' | 'userId'>>): Promise<UserProfile> {
    const result = await db.update(userProfiles).set(profile).where(eq(userProfiles.userId, userId)).returning();
    return result[0];
  }

  async createMatch(match: any): Promise<Match> {
    const result = await db.insert(matches).values(match).returning();
    return result[0];
  }

  async addMatchPlayer(player: any): Promise<MatchPlayer> {
    const result = await db.insert(matchPlayers).values(player).returning();
    return result[0];
  }

  async getUserMatches(userId: string, limit: number = 10): Promise<Match[]> {
    const userMatches = await db
      .select({ matchId: matchPlayers.matchId })
      .from(matchPlayers)
      .where(eq(matchPlayers.userId, userId))
      .limit(limit);
    
    const matchIds = userMatches.map(m => m.matchId);
    if (matchIds.length === 0) return [];
    
    // Validate matchIds
    if (!Array.isArray(matchIds) || matchIds.some(id => typeof id !== 'string')) {
      return [];
    }
    
    const result = await db
      .select()
      .from(matches)
      .where((m) => matchIds.includes(m.id))
      .orderBy(desc(matches.createdAt))
      .limit(limit);
    
    return result;
  }

  async getLeaderboardByWins(limit: number = 10): Promise<any[]> {
    const result = await db
      .select({
        userId: userProfiles.userId,
        username: users.username,
        totalWins: userProfiles.totalWins,
        rankLevel: userProfiles.rankLevel,
        xp: userProfiles.xp,
      })
      .from(userProfiles)
      .innerJoin(users, eq(userProfiles.userId, users.id))
      .orderBy(desc(userProfiles.totalWins))
      .limit(limit);
    
    return result;
  }

  async getLeaderboardByImpostorWins(limit: number = 10): Promise<any[]> {
    const result = await db
      .select({
        userId: userProfiles.userId,
        username: users.username,
        impostorWins: userProfiles.impostorWins,
        impostorWinStreak: userProfiles.impostorWinStreak,
      })
      .from(userProfiles)
      .innerJoin(users, eq(userProfiles.userId, users.id))
      .orderBy(desc(userProfiles.impostorWins))
      .limit(limit);
    
    return result;
  }

  async addFriend(userId: string, friendId: string): Promise<Friend> {
    const result = await db.insert(friends).values({ userId, friendId }).returning();
    return result[0];
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await db.delete(friends).where(and(eq(friends.userId, userId), eq(friends.friendId, friendId)));
  }

  async getFriends(userId: string): Promise<User[]> {
    // Validate userId
    if (!userId || typeof userId !== 'string') {
      return [];
    }
    
    const userFriends = await db
      .select({ friendId: friends.friendId })
      .from(friends)
      .where(eq(friends.userId, userId));
    
    const friendIds = userFriends.map(f => f.friendId);
    if (friendIds.length === 0) return [];
    
    // Validate friendIds
    if (!Array.isArray(friendIds) || friendIds.some(id => typeof id !== 'string')) {
      return [];
    }
    
    const result = await db
      .select()
      .from(users)
      .where((u) => friendIds.includes(u.id));
    
    return result;
  }
}

export const storage = new DatabaseStorage();
