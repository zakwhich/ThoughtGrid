import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PostDetail from "@/pages/PostDetail";
import Admin from "@/pages/Admin";
import Projects from "@/pages/Projects";
import Research from "@/pages/Research";
import Publications from "@/pages/Publications";
import About from "@/pages/About";
import Contact from "@/pages/Contact";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/post/:slug" component={PostDetail} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/:section" component={Admin} />
      <Route path="/projects" component={Projects} />
      <Route path="/research" component={Research} />
      <Route path="/publications" component={Publications} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
