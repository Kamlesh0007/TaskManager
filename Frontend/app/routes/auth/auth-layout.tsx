import { Loader } from "@/components/loader";
import { useAuth } from "@/provider/auth-context";
import { Navigate, Outlet } from "react-router";

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader/>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};

export default AuthLayout;