import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";
import ThreeDots from "../loaders/ThreeDots";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div>
        <ThreeDots />
      </div>
    );
  }

 return user ? children : <Navigate to="/signin" />;
};

export default ProtectedRoute;
