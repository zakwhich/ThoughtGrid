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
    const base = "bg-accent text-foreground/70 border border-border";
    const subtleMap: Record<string, string> = {
      Technology: base,
      Design: base,
      Philosophy: base,
      Learning: base,
      Data: base,
      JavaScript: base,
      Creativity: base,
    };
    return subtleMap[category] || base;
  };

  if (featured) {
    return (
      <Card className="group hover:shadow-md transition-all duration-200 overflow-hidden md:hover:-translate-y-0.5 will-change-transform">
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
    <Card className="group hover:shadow-md transition-all duration-200 overflow-hidden md:hover:-translate-y-0.5 will-change-transform">
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
            </div>
          </CardContent>
        </a>
      </Link>
    </Card>
  );
}