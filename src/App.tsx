import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import PatternAnalysis from "./pages/PatternAnalysis";
import PomodoroTimer from "./pages/PomodoroTimer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { isLoading, isAuthenticated } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-focus border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Welcome />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Welcome />} />
            <Route path="/patterns" element={isAuthenticated ? <PatternAnalysis /> : <Welcome />} />
            <Route path="/pomodoro" element={isAuthenticated ? <PomodoroTimer /> : <Welcome />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
