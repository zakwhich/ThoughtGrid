import { useState } from "react";
import { Link, useLocation } from "wouter";
import { X, Lightbulb, Code, FlaskConical, Book, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CurrentlyReading from "@/components/CurrentlyReading";
import CurrentlyListening from "@/components/CurrentlyListening";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const navigationItems = [
    { href: "/", label: "thoughts", icon: Lightbulb },
    { href: "/projects", label: "Projects", icon: Code },
    { href: "/research", label: "Research", icon: FlaskConical },
    { href: "/publications", label: "Publications", icon: Book },
    { href: "/about", label: "About", icon: User },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-full w-80 bg-sidebar shadow-xl transform transition-sidebar z-50 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
      data-testid="sidebar"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-sidebar-foreground">Navigation</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            data-testid="button-close-sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Main Navigation */}
        <nav className="space-y-2 mb-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href === "/" && location === "/");
            
            return (
              <Link key={item.href} href={item.href}>
                <a 
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg transition-colors",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  onClick={onClose}
                  data-testid={`link-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Currently Reading Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-sidebar-foreground/70 uppercase tracking-wide mb-3">
            Currently Reading
          </h3>
          <CurrentlyReading />
        </div>

        {/* Currently Listening Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-sidebar-foreground/70 uppercase tracking-wide mb-3">
            Currently Listening
          </h3>
          <CurrentlyListening />
        </div>
      </div>
    </div>
  );
}
