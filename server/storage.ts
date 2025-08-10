import { 
  users, posts, comments, currentlyReading, currentlyListening,
  type User, type InsertUser, type Post, type InsertPost, 
  type Comment, type InsertComment, type CurrentlyReading, 
  type InsertCurrentlyReading, type CurrentlyListening, 
  type InsertCurrentlyListening 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Posts
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPublishedPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getPostById(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<InsertPost>): Promise<Post>;
  deletePost(id: string): Promise<void>;
  publishPost(id: string): Promise<Post>;

  // Comments
  getCommentsByPostId(postId: string): Promise<Comment[]>;
  getApprovedCommentsByPostId(postId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  approveComment(id: string): Promise<Comment>;
  deleteComment(id: string): Promise<void>;

  // Currently Reading
  getCurrentlyReading(): Promise<CurrentlyReading[]>;
  getActiveCurrentlyReading(): Promise<CurrentlyReading | undefined>;
  createCurrentlyReading(reading: InsertCurrentlyReading): Promise<CurrentlyReading>;
  updateCurrentlyReading(id: string, reading: Partial<InsertCurrentlyReading>): Promise<CurrentlyReading>;

  // Currently Listening
  getCurrentlyListening(): Promise<CurrentlyListening[]>;
  getActiveCurrentlyListening(): Promise<CurrentlyListening | undefined>;
  createCurrentlyListening(listening: InsertCurrentlyListening): Promise<CurrentlyListening>;
  updateCurrentlyListening(id: string, listening: Partial<InsertCurrentlyListening>): Promise<CurrentlyListening>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Posts
  async getPosts(limit = 10, offset = 0): Promise<Post[]> {
    return await db.select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPublishedPosts(limit = 10, offset = 0): Promise<Post[]> {
    return await db.select()
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post || undefined;
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async updatePost(id: string, post: Partial<InsertPost>): Promise<Post> {
    const [updatedPost] = await db.update(posts)
      .set({ ...post, updatedAt: sql`now()` })
      .where(eq(posts.id, id))
      .returning();
    return updatedPost;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async publishPost(id: string): Promise<Post> {
    const [publishedPost] = await db.update(posts)
      .set({ 
        status: "published", 
        publishedAt: sql`now()`,
        updatedAt: sql`now()`
      })
      .where(eq(posts.id, id))
      .returning();
    return publishedPost;
  }

  // Comments
  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    return await db.select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  async getApprovedCommentsByPostId(postId: string): Promise<Comment[]> {
    return await db.select()
      .from(comments)
      .where(and(eq(comments.postId, postId), eq(comments.approved, true)))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async approveComment(id: string): Promise<Comment> {
    const [approvedComment] = await db.update(comments)
      .set({ approved: true })
      .where(eq(comments.id, id))
      .returning();
    return approvedComment;
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  // Currently Reading
  async getCurrentlyReading(): Promise<CurrentlyReading[]> {
    return await db.select()
      .from(currentlyReading)
      .orderBy(desc(currentlyReading.createdAt));
  }

  async getActiveCurrentlyReading(): Promise<CurrentlyReading | undefined> {
    const [reading] = await db.select()
      .from(currentlyReading)
      .where(eq(currentlyReading.isActive, true))
      .orderBy(desc(currentlyReading.createdAt))
      .limit(1);
    return reading || undefined;
  }

  async createCurrentlyReading(reading: InsertCurrentlyReading): Promise<CurrentlyReading> {
    const [newReading] = await db.insert(currentlyReading).values(reading).returning();
    return newReading;
  }

  async updateCurrentlyReading(id: string, reading: Partial<InsertCurrentlyReading>): Promise<CurrentlyReading> {
    const [updatedReading] = await db.update(currentlyReading)
      .set(reading)
      .where(eq(currentlyReading.id, id))
      .returning();
    return updatedReading;
  }

  // Currently Listening
  async getCurrentlyListening(): Promise<CurrentlyListening[]> {
    return await db.select()
      .from(currentlyListening)
      .orderBy(desc(currentlyListening.lastPlayedAt));
  }

  async getActiveCurrentlyListening(): Promise<CurrentlyListening | undefined> {
    const [listening] = await db.select()
      .from(currentlyListening)
      .where(eq(currentlyListening.isActive, true))
      .orderBy(desc(currentlyListening.lastPlayedAt))
      .limit(1);
    return listening || undefined;
  }

  async createCurrentlyListening(listening: InsertCurrentlyListening): Promise<CurrentlyListening> {
    const [newListening] = await db.insert(currentlyListening).values(listening).returning();
    return newListening;
  }

  async updateCurrentlyListening(id: string, listening: Partial<InsertCurrentlyListening>): Promise<CurrentlyListening> {
    const [updatedListening] = await db.update(currentlyListening)
      .set(listening)
      .where(eq(currentlyListening.id, id))
      .returning();
    return updatedListening;
  }
}

export const storage = new DatabaseStorage();
