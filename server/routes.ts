import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPostSchema, insertCommentSchema, 
  insertCurrentlyReadingSchema, insertCurrentlyListeningSchema 
} from "@shared/schema";
import { ObjectStorageService } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Posts API
  app.get("/api/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getPublishedPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:slug", async (req, res) => {
    try {
      const post = await storage.getPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  // Comments API
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const comments = await storage.getApprovedCommentsByPostId(req.params.postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/posts/:postId/comments", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse({
        ...req.body,
        postId: req.params.postId
      });
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  // Currently Reading API
  app.get("/api/currently-reading", async (req, res) => {
    try {
      const reading = await storage.getActiveCurrentlyReading();
      res.json(reading);
    } catch (error) {
      console.error("Error fetching currently reading:", error);
      res.status(500).json({ error: "Failed to fetch currently reading" });
    }
  });

  // Currently Listening API
  app.get("/api/currently-listening", async (req, res) => {
    try {
      const listening = await storage.getActiveCurrentlyListening();
      res.json(listening);
    } catch (error) {
      console.error("Error fetching currently listening:", error);
      res.status(500).json({ error: "Failed to fetch currently listening" });
    }
  });

  // Admin API routes
  app.get("/api/admin/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching admin posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.post("/api/admin/posts", async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  app.put("/api/admin/posts/:id", async (req, res) => {
    try {
      const postData = insertPostSchema.partial().parse(req.body);
      const post = await storage.updatePost(req.params.id, postData);
      res.json(post);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  app.post("/api/admin/posts/:id/publish", async (req, res) => {
    try {
      const post = await storage.publishPost(req.params.id);
      res.json(post);
    } catch (error) {
      console.error("Error publishing post:", error);
      res.status(500).json({ error: "Failed to publish post" });
    }
  });

  app.delete("/api/admin/posts/:id", async (req, res) => {
    try {
      await storage.deletePost(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Image upload for posts
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/post-images", async (req, res) => {
    try {
      if (!req.body.imageURL) {
        return res.status(400).json({ error: "imageURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(req.body.imageURL);
      
      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting post image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve uploaded images
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      return res.sendStatus(404);
    }
  });

  // Admin comments management
  app.get("/api/admin/comments", async (req, res) => {
    try {
      const postId = req.query.postId as string;
      if (!postId) {
        return res.status(400).json({ error: "postId is required" });
      }
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching admin comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/admin/comments/:id/approve", async (req, res) => {
    try {
      const comment = await storage.approveComment(req.params.id);
      res.json(comment);
    } catch (error) {
      console.error("Error approving comment:", error);
      res.status(500).json({ error: "Failed to approve comment" });
    }
  });

  app.delete("/api/admin/comments/:id", async (req, res) => {
    try {
      await storage.deleteComment(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
