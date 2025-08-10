import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Menu, ArrowLeft, Share2, Twitter, Facebook, Linkedin, 
  Copy, Heart, MessageCircle, ThumbsUp 
} from "lucide-react";
import type { Post, Comment } from "@shared/schema";

export default function PostDetail() {
  const [, params] = useRoute("/post/:slug");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commentForm, setCommentForm] = useState({
    authorName: "",
    authorEmail: "",
    content: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: post, isLoading: postLoading } = useQuery<Post>({
    queryKey: ["/api/posts", params?.slug],
    enabled: !!params?.slug,
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["/api/posts", post?.id, "comments"],
    enabled: !!post?.id,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (commentData: typeof commentForm) => {
      const response = await apiRequest("POST", `/api/posts/${post!.id}/comments`, commentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", post?.id, "comments"] });
      setCommentForm({ authorName: "", authorEmail: "", content: "" });
      toast({
        title: "Comment submitted",
        description: "Your comment has been submitted for review.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.authorName || !commentForm.authorEmail || !commentForm.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    createCommentMutation.mutate(commentForm);
  };

  const sharePost = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || "";
    
    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Post link has been copied to clipboard.",
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-muted rounded mb-8 w-1/2"></div>
            <div className="h-96 bg-muted rounded mb-8"></div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Post not found</h1>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="mr-4"
                data-testid="button-open-sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Alex Chen</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article>
          {/* Post Header */}
          <header className="mb-8">
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary hover:text-primary/80"
                onClick={() => window.history.back()}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to thoughts
              </Button>
            </div>
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              <span className="mx-2">•</span>
              <span>{estimateReadingTime(post.content)} min read</span>
              <span className="ml-auto">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                  {post.category}
                </span>
              </span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">{post.title}</h1>
            {post.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-96 object-cover rounded-xl shadow-sm mb-8"
            />
          )}

          {/* Post Content */}
          <div 
            className="prose prose-lg max-w-none markdown-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Social Sharing */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Share this post</h3>
            <div className="flex space-x-4">
              <Button 
                onClick={() => sharePost("twitter")}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                data-testid="button-share-twitter"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button 
                onClick={() => sharePost("facebook")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-share-facebook"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button 
                onClick={() => sharePost("linkedin")}
                className="bg-blue-700 hover:bg-blue-800 text-white"
                data-testid="button-share-linkedin"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button 
                onClick={() => sharePost("copy")}
                variant="secondary"
                data-testid="button-copy-link"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-2xl font-semibold text-foreground mb-6">
              Comments ({comments.length})
            </h3>
            
            {/* Comment Form */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h4 className="text-lg font-medium text-foreground mb-4">Leave a comment</h4>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={commentForm.authorName}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, authorName: e.target.value }))}
                      data-testid="input-comment-name"
                    />
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={commentForm.authorEmail}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, authorEmail: e.target.value }))}
                      data-testid="input-comment-email"
                    />
                  </div>
                  <Textarea
                    rows={4}
                    placeholder="Your comment..."
                    value={commentForm.content}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                    data-testid="textarea-comment-content"
                  />
                  <Button 
                    type="submit" 
                    disabled={createCommentMutation.isPending}
                    data-testid="button-submit-comment"
                  >
                    {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-4 bg-muted rounded"></div>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium text-sm">
                          {comment.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h5 className="font-medium text-foreground">{comment.authorName}</h5>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-foreground leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
