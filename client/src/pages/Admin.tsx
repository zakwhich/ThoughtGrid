import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import MarkdownEditor from "@/components/MarkdownEditor";
import { Edit, Trash2, Eye, Plus, Check, X } from "lucide-react";
import type { Post, Comment } from "@shared/schema";

export default function Admin() {
  const [, params] = useRoute("/admin/:section?");
  const activeTab = params?.section || "posts";
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [postForm, setPostForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "",
    status: "draft",
    featuredImage: "",
    authorId: "admin" // TODO: Get from auth
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/admin/posts"],
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["/api/admin/comments"],
    queryKey: selectedPost ? ["/api/admin/comments", { postId: selectedPost.id }] : undefined,
    enabled: !!selectedPost,
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: async (postData: typeof postForm) => {
      const response = await apiRequest("POST", "/api/admin/posts", postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      resetForm();
      toast({ title: "Post created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create post", variant: "destructive" });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof postForm> }) => {
      const response = await apiRequest("PUT", `/api/admin/posts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      setIsEditing(false);
      setSelectedPost(null);
      resetForm();
      toast({ title: "Post updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update post", variant: "destructive" });
    },
  });

  const publishPostMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/admin/posts/${id}/publish`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      toast({ title: "Post published successfully" });
    },
    onError: () => {
      toast({ title: "Failed to publish post", variant: "destructive" });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      toast({ title: "Post deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete post", variant: "destructive" });
    },
  });

  const approveCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/admin/comments/${id}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      toast({ title: "Comment approved" });
    },
    onError: () => {
      toast({ title: "Failed to approve comment", variant: "destructive" });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/comments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      toast({ title: "Comment deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete comment", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setPostForm({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      category: "",
      status: "draft",
      featuredImage: "",
      authorId: "admin"
    });
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedPost) {
      updatePostMutation.mutate({ id: selectedPost.id, data: postForm });
    } else {
      createPostMutation.mutate(postForm);
    }
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post);
    setIsEditing(true);
    setPostForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      category: post.category,
      status: post.status,
      featuredImage: post.featuredImage || "",
      authorId: post.authorId
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-muted-foreground">Create and manage your blog posts</p>
              </div>
              <Button onClick={() => window.location.href = "/"} variant="outline">
                View Site
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" data-testid="tab-posts">Posts</TabsTrigger>
            <TabsTrigger value="comments" data-testid="tab-comments">Comments</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Post Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isEditing ? "Edit Post" : "Create New Post"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePostSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Title
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter post title..."
                        value={postForm.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setPostForm(prev => ({ 
                            ...prev, 
                            title, 
                            slug: generateSlug(title) 
                          }));
                        }}
                        data-testid="input-post-title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Slug
                      </label>
                      <Input
                        type="text"
                        placeholder="post-url-slug"
                        value={postForm.slug}
                        onChange={(e) => setPostForm(prev => ({ ...prev, slug: e.target.value }))}
                        data-testid="input-post-slug"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Excerpt
                      </label>
                      <Textarea
                        placeholder="Brief description of the post..."
                        value={postForm.excerpt}
                        onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                        rows={3}
                        data-testid="textarea-post-excerpt"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Category
                        </label>
                        <Select 
                          value={postForm.category} 
                          onValueChange={(value) => setPostForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger data-testid="select-post-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Philosophy">Philosophy</SelectItem>
                            <SelectItem value="Learning">Learning</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Status
                        </label>
                        <Select 
                          value={postForm.status} 
                          onValueChange={(value) => setPostForm(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger data-testid="select-post-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <MarkdownEditor
                      value={postForm.content}
                      onChange={(value) => setPostForm(prev => ({ ...prev, content: value }))}
                    />

                    <div className="flex gap-4">
                      <Button 
                        type="submit" 
                        disabled={createPostMutation.isPending || updatePostMutation.isPending}
                        data-testid="button-save-post"
                      >
                        {isEditing ? "Update Post" : "Create Post"}
                      </Button>
                      {isEditing && (
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setSelectedPost(null);
                            resetForm();
                          }}
                          data-testid="button-cancel-edit"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Posts List */}
              <Card>
                <CardHeader>
                  <CardTitle>Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div key={post.id} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-foreground">{post.title}</h4>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditPost(post)}
                                data-testid={`button-edit-post-${post.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {post.status === "draft" && (
                                <Button
                                  size="sm"
                                  onClick={() => publishPostMutation.mutate(post.id)}
                                  data-testid={`button-publish-post-${post.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deletePostMutation.mutate(post.id)}
                                data-testid={`button-delete-post-${post.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant={post.status === "published" ? "default" : "secondary"}>
                              {post.status}
                            </Badge>
                            <span>•</span>
                            <span>{formatDate(post.createdAt)}</span>
                            <span>•</span>
                            <span>{post.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No posts yet. Create your first post!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Comment Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                {posts.length > 0 && (
                  <div className="mb-6">
                    <Select onValueChange={(postId) => {
                      const post = posts.find(p => p.id === postId);
                      setSelectedPost(post || null);
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a post to view comments" />
                      </SelectTrigger>
                      <SelectContent>
                        {posts.map((post) => (
                          <SelectItem key={post.id} value={post.id}>
                            {post.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedPost ? (
                  commentsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse border border-border rounded-lg p-4">
                          <div className="h-4 bg-muted rounded mb-2 w-1/4"></div>
                          <div className="h-3 bg-muted rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium text-foreground">{comment.authorName}</h5>
                              <p className="text-sm text-muted-foreground">{comment.authorEmail}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={comment.approved ? "default" : "secondary"}>
                                {comment.approved ? "Approved" : "Pending"}
                              </Badge>
                              {!comment.approved && (
                                <Button
                                  size="sm"
                                  onClick={() => approveCommentMutation.mutate(comment.id)}
                                  data-testid={`button-approve-comment-${comment.id}`}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteCommentMutation.mutate(comment.id)}
                                data-testid={`button-delete-comment-${comment.id}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-foreground">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No comments for this post yet.</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Select a post to view and moderate comments.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Blog Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Site Title
                    </label>
                    <Input type="text" defaultValue="Alex Chen" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Site Description
                    </label>
                    <Textarea 
                      rows={3}
                      defaultValue="Exploring ideas at the intersection of technology, design, and human experience"
                    />
                  </div>
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
