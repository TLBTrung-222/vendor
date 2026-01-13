// App.tsx
import { useNavigate } from "react-router-dom";
import VendorOnboardingFlow from "./pages/VendorOnboarding.tsx";
import ThemeProvider from "./theme-provider.tsx";
import { useState, useEffect, createContext } from "react";
import { PusherProvider } from "./contexts/PusherContext.tsx";
import { UserProvider } from "./contexts/UserContext.tsx";
import { Cookies } from "react-cookie";
import "./i18n";
import { VendorRoute } from "./Route.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import "./assets/bootstrap/bootstrap.css";
import "./App.scss";

const COOKIE_ACCESS_TOKEN = "atk";
const COOKIE_REFRESH_TOKEN = "rtk";

const cookies = new Cookies();
const getCookie = (name: string): string => cookies.get(name) || "";

// Auth Context
export const AuthContext = createContext<{ isAuthenticated: boolean }>({
  isAuthenticated: false,
});

// Move all logic into this child component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const decodeToken = (token: string) => {
    try {
      const payload = token.split(".")[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access");
    const refreshToken = urlParams.get("refresh");

    if (accessToken) {
      const decoded = decodeToken(accessToken);
      

      // Clear old data ONCE
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("onboardingStep");

      // Save new data
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken || "");
      localStorage.setItem("userEmail", decoded.user.email);
      // localStorage.setItem(
      //   "onboardingStep",
      //   decoded.user.vendorOnboardingStep || "1"
      // );

      setIsAuthenticated(true);

      navigate("/", { replace: true });
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <UserProvider>
          <PusherProvider>
            <VendorRoute />
          </PusherProvider>
        </UserProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Top-level component — now correctly wraps everything in <Router>
export default App;
