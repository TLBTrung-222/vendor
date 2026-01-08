import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.tsx";
import Home from "./pages/Home/Home.tsx";

interface TAuthProtectedRoute {
  requireAuth: boolean;
}

const AuthProtectedRoute: React.FC<TAuthProtectedRoute> = ({ requireAuth }) => {
  const { isAuthenticated } = useAuth();

  return <Outlet />;
};

export const VendorRoute = () => {
  return (
    <Routes>
      <Route element={<AuthProtectedRoute requireAuth={true} />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
};
