// App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import VendorOnboardingFlow from "./pages/VendorOnboarding.tsx";
import ThemeProvider from "./theme-provider.tsx";
import { useState, useEffect, createContext } from "react";
import { PusherProvider } from "./contexts/PusherContext.tsx";
import { UserProvider } from "./contexts/UserContext.tsx";
import { Cookies } from "react-cookie";

const COOKIE_ACCESS_TOKEN = "atk";
const COOKIE_REFRESH_TOKEN = "rtk";

const cookies = new Cookies();
const getCookie = (name: string): string => cookies.get(name) || "";

// Auth Context
export const AuthContext = createContext<{ isAuthenticated: boolean }>({
  isAuthenticated: false,
});

// Move all logic into this child component
function AppWithRouting() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return {};
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access")
    const refreshToken = urlParams.get("refresh");

    if (accessToken) {
      const decoded = decodeToken(accessToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken || "");
      localStorage.setItem("userEmail", decoded.user.email);      
      localStorage.setItem(
        "vendorOnboardingStep",
        decoded.user.vendorOnboardingStep || "1"
      );

      setIsAuthenticated(true);
      navigate("/");
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      <ThemeProvider>
        <UserProvider>
          <PusherProvider>
            <Routes>
              <Route path="/" element={<VendorOnboardingFlow />} />
            </Routes>
          </PusherProvider>
        </UserProvider>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

// Top-level component — now correctly wraps everything in <Router>
export default function App() {
  return (
    <Router>
      <AppWithRouting />
    </Router>
  );
}
