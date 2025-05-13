import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import VendorOnboardingFlow from "./pages/VendorOnboarding.tsx";
import SignIn from "./pages/SignIn.tsx";
import ThemeProvider from "./theme-provider.tsx";
import { useState, useEffect, createContext } from "react";

// Create an auth context
export const AuthContext = createContext<{
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}>({
    isAuthenticated: false,
    login: async () => false,
    logout: () => {},
});

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is already authenticated based on tokens in localStorage
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (email: string, password: string) => {
        // Authentication is now handled in the SignIn component directly
        // This is just for state management in the app
        setIsAuthenticated(true);
        return true;
    };

    const logout = () => {
        // Remove tokens from localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            <ThemeProvider>
                <Router>
                    <Routes>
                        <Route
                            path="/signin"
                            element={
                                isAuthenticated ? (
                                    <Navigate to="/" />
                                ) : (
                                    <SignIn />
                                )
                            }
                        />
                        <Route
                            path="/"
                            element={
                                isAuthenticated ? (
                                    <VendorOnboardingFlow />
                                ) : (
                                    <Navigate to="/signin" />
                                )
                            }
                        />
                    </Routes>
                </Router>
            </ThemeProvider>
        </AuthContext.Provider>
    );
}
