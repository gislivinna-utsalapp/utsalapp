import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import Home from "@/pages/Home";
import PostDetail from "@/pages/PostDetail";
import Store from "@/pages/Store";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CreatePost from "@/pages/CreatePost";
import SearchPage from "@/pages/SearchPage";
import CategoriesPage from "@/pages/CategoriesPage";
import Profile from "@/pages/Profile";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/post/:id" component={PostDetail} />
      <Route path="/store/:id" component={Store} />
      <Route path="/innskraning" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/stofna" component={CreatePost} />
      <Route path="/breyta/:id" component={CreatePost} />
      <Route path="/leit" component={SearchPage} />
      <Route path="/flokkar" component={CategoriesPage} />
      <Route path="/profill" component={Profile} />
      <Route path="/um" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <BottomNav />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
