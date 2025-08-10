import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Music } from "lucide-react";
import type { CurrentlyListening as CurrentlyListeningType } from "@shared/schema";

export default function CurrentlyListening() {
  const { data: listening, isLoading } = useQuery<CurrentlyListeningType>({
    queryKey: ["/api/currently-listening"],
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <div className="w-16 h-16 bg-muted rounded shadow-sm"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!listening) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <Music className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Not currently listening to anything</p>
        </CardContent>
      </Card>
    );
  }

  const formatLastPlayed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex space-x-3">
          {listening.albumCover ? (
            <img 
              src={listening.albumCover} 
              alt={`${listening.title} album cover`}
              className="w-16 h-16 rounded shadow-sm object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-muted rounded shadow-sm flex items-center justify-center">
              <Music className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{listening.title}</p>
            <p className="text-xs text-muted-foreground truncate">{listening.artist}</p>
            {listening.lastPlayedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Last played: {formatLastPlayed(listening.lastPlayedAt)}
              </p>
            )}
            {listening.lastFmUrl && (
              <a 
                href={listening.lastFmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:text-primary/80 mt-1 inline-block"
              >
                View on Last.fm
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
