import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function About() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">About Me</h2>
          <p className="text-xl text-muted-foreground">
            Get to know more about my background, interests, and what drives my work.
          </p>
        </div>

        <div className="prose prose-lg max-w-none markdown-content">
          <p>
            Welcome to my corner of the internet. I'm a passionate technologist, designer, and 
            writer exploring the fascinating intersection of technology, design, and human experience.
          </p>
          
          <h3>What I Do</h3>
          <p>
            I spend my time building web applications, researching new technologies, and writing 
            about the lessons learned along the way. My work focuses on creating simple, elegant 
            solutions to complex problems.
          </p>
          
          <h3>My Interests</h3>
          <p>
            When I'm not coding, you can find me reading about philosophy, listening to jazz, 
            or exploring new ideas in design and user experience. I believe that the best 
            technology is invisible - it just works, allowing people to focus on what matters most.
          </p>
          
          <h3>Get in Touch</h3>
          <p>
            I love connecting with fellow creators, thinkers, and builders. Feel free to reach 
            out if you'd like to discuss ideas, collaborate on projects, or just say hello.
          </p>
        </div>
      </main>
    </div>
  );
}
