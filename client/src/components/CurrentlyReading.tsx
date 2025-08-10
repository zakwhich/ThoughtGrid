import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Book } from "lucide-react";
import type { CurrentlyReading as CurrentlyReadingType } from "@shared/schema";

export default function CurrentlyReading() {
  const { data: reading, isLoading } = useQuery<CurrentlyReadingType>({
    queryKey: ["/api/currently-reading"],
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <div className="w-16 h-24 bg-muted rounded shadow-sm"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reading) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <Book className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Not currently reading anything</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex space-x-3">
          {reading.coverImage ? (
            <img 
              src={reading.coverImage} 
              alt={`${reading.title} cover`}
              className="w-16 h-24 rounded shadow-sm object-cover"
            />
          ) : (
            <div className="w-16 h-24 bg-muted rounded shadow-sm flex items-center justify-center">
              <Book className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{reading.title}</p>
            <p className="text-xs text-muted-foreground truncate">by {reading.author}</p>
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${reading.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{reading.progress}% complete</p>
            </div>
            {reading.goodreadsUrl && (
              <a 
                href={reading.goodreadsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:text-primary/80 mt-1 inline-block"
              >
                View on Goodreads
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
