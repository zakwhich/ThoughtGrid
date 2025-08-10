import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, ArrowRight } from "lucide-react";
import type { Post } from "@shared/schema";

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: "bg-primary/10 text-primary",
      Design: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
      Philosophy: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
      Learning: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
      Data: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      JavaScript: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      Creativity: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
    };
    return colors[category] || "bg-secondary text-secondary-foreground";
  };

  if (featured) {
    return (
      <Card className="group hover:shadow-md transition-shadow overflow-hidden">
        <div className="md:flex">
          {post.featuredImage && (
            <div className="md:w-1/3">
              <img 
                src={post.featuredImage} 
                alt={post.title}
                className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className={post.featuredImage ? "md:w-2/3 p-8" : "p-8"}>
            <div className="flex items-center text-sm text-muted-foreground mb-3">
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              <span className="mx-2">•</span>
              <span>{estimateReadingTime(post.content)} min read</span>
              <span className="ml-auto">
                <Badge className={getCategoryColor(post.category)}>
                  {post.category}
                </Badge>
              </span>
            </div>
            <Link href={`/post/${post.slug}`}>
              <a data-testid={`link-post-${post.slug}`}>
                <h4 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h4>
              </a>
            </Link>
            {post.excerpt && (
              <p className="text-muted-foreground leading-relaxed mb-4">
                {post.excerpt}
              </p>
            )}
            <Link href={`/post/${post.slug}`}>
              <a className="inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors" data-testid={`link-read-post-${post.slug}`}>
                Read full post
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-md transition-shadow overflow-hidden">
      <Link href={`/post/${post.slug}`}>
        <a data-testid={`card-post-${post.slug}`}>
          {post.featuredImage && (
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          <CardContent className="p-6">
            <div className="flex items-center text-sm text-muted-foreground mb-3">
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              <span className="mx-2">•</span>
              <span>{estimateReadingTime(post.content)} min read</span>
            </div>
            <h4 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {post.title}
            </h4>
            {post.excerpt && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center justify-between">
              <Badge className={getCategoryColor(post.category)}>
                {post.category}
              </Badge>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <span className="flex items-center text-sm">
                  <Heart className="h-4 w-4 mr-1" /> 0
                </span>
                <span className="flex items-center text-sm">
                  <MessageCircle className="h-4 w-4 mr-1" /> 0
                </span>
              </div>
            </div>
          </CardContent>
        </a>
      </Link>
    </Card>
  );
}
