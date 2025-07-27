import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getUser } from "@/auth/authService";

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await getUser();
        if (u) {
          setUser(u);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // Not logged in
      }
    };
    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
