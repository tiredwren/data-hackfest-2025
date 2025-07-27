// src/components/LoginButton.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { Button } from "@/components/ui/button";
import { login, handleRedirectCallback, getUser, logout } from "@/auth/authService";

const LoginButton = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true); // start in loading state
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const u = await getUser();
        if (u) {
          setUser(u);
          setIsAuthenticated(true);
          navigate("/welcome");
        }
      } catch (err) {
        console.log("User not logged in:", err);
      } finally {
        setLoading(false);
      }
    };

    const onUrlOpen = async (data: { url: string }) => {
      const url = data?.url;
      if (url?.includes("code=")) {
        try {
          setLoading(true);
          await handleRedirectCallback(url);
          const userInfo = await getUser();
          setUser(userInfo);
          setIsAuthenticated(true);
          navigate("/welcome");
        } catch (err) {
          console.error("Redirect handling failed:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    checkExistingUser();

    const listener = App.addListener("appUrlOpen", onUrlOpen);

    return () => {
      listener.remove();
    };
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(); // opens native browser tab
    } catch (err) {
      alert(`Login error: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <span>Welcome, {user?.name || "user"}!</span>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleLogin} disabled={loading}>
      {loading ? "Logging in..." : "Sign In"}
    </Button>
  );
};

export default LoginButton;
