import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import PatternAnalysis from "./pages/PatternAnalysis";
import PomodoroTimer from "./pages/PomodoroTimer";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/authContext";
import { handleRedirectCallback } from "@/auth/authService";

const queryClient = new QueryClient();

const AppInner = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // for when the app is opened from an external auth redirect
    const listener = CapacitorApp.addListener("appUrlOpen", async (data) => {
      const url = data?.url;
      if (url?.includes("code=") && url?.includes("state=")) {
        try {
          await handleRedirectCallback();
          navigate("/welcome");
        } catch (e) {
          console.error("Auth redirect (appUrlOpen) failed:", e);
        }
      }
    });

    // for when the app is loaded directly with /?code=... (e.g. after browser login)
    const checkInitialRedirect = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has("code") && params.has("state")) {
        try {
          await handleRedirectCallback();
          navigate("/welcome");
          window.history.replaceState({}, document.title, "/welcome"); // clean URL
        } catch (e) {
          console.error("Auth redirect (window.location) failed:", e);
        }
      }
    };

    checkInitialRedirect();

    return () => {
      listener.remove();
    };
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patterns" element={<PatternAnalysis />} />
      <Route path="/pomodoro" element={<PomodoroTimer />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppInner />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
