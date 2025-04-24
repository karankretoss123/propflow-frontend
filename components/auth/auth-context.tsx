"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type UserPlan = "starter" | "standard" | "premium"

interface User {
  id: string
  name: string
  email: string
  plan: UserPlan
  isAuthenticated: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, plan?: UserPlan) => Promise<LoginResponse>
  register: (email: string, password: string, name?: string, plan?: UserPlan) => Promise<LoginResponse>;
  logout: () => void
  updatePlan: (plan: UserPlan) => void
  loading: boolean
}


interface LoginResponse {
  message?: string;
  accessToken?: string;
  user?: {
    user_id: string;
    name: string;
    email: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  // Load user from localStorage on initial render
  // useEffect(() => {
  useEffect(() => {
    setLoading(true)
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("propflow-user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          // Handle legacy plan names
          if (parsedUser.plan === "free") parsedUser.plan = "starter";
          if (parsedUser.plan === "basic") parsedUser.plan = "standard";
          if (parsedUser.plan === "pro") parsedUser.plan = "premium";

          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("propflow-user");
      } finally {
        // ✅ Always end loading no matter what
        setLoading(false);
      }
    };

    loadUser();
  }, []);
  // }, [])

  const login = async (email: string, password: string, plan: UserPlan = "starter"): Promise<LoginResponse> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      // This will be caught in page.tsx catch block
      throw new Error(data.message || "Login failed");
    }
    const rawAuth0Id = data.user.id.replace(/^auth0\|/, "");
    const loggedInUser: User = {
      id: rawAuth0Id,
      name: data.user.name,
      email: data.user.email,
      plan: plan,
      isAuthenticated: true,
    };

    setUser(loggedInUser);
    localStorage.setItem("propflow-user", JSON.stringify(loggedInUser));
    localStorage.setItem("propflow-user-plan", plan);
    localStorage.setItem("propflow-access-token", data.accessToken);

    return data;
  };

  const register = async (email: string, password: string, name: string = "", plan: UserPlan = "starter"): Promise<LoginResponse> => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    const newUser: User = {
      id: data.user.auth0_id,
      name: data.user.name,
      email: data.user.email,
      plan: plan,
      isAuthenticated: true,
    };

    setUser(newUser);
    localStorage.setItem("propflow-user", JSON.stringify(newUser));
    localStorage.setItem("propflow-user-plan", plan);
    localStorage.setItem("propflow-access-token", data.accessToken);

    return data;
  };


  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("propflow-user")
    localStorage.removeItem("propflow-user-plan")
    localStorage.clear()
  }

  // Update plan function
  const updatePlan = (plan: UserPlan) => {
    if (user) {
      const updatedUser = { ...user, plan }
      setUser(updatedUser)
      localStorage.setItem("propflow-user", JSON.stringify(updatedUser))
      localStorage.setItem("propflow-user-plan", plan) // For compatibility with existing code
    }
  }

  return <AuthContext.Provider value={{
    user, login, logout, updatePlan, register, loading
  }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
