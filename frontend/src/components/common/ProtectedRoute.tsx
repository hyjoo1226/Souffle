import { Navigate } from "react-router-dom";
import { isLoggedIn } from "@/utils/auth";
import { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!isLoggedIn()) {
    // 로그인 안 된 경우
    return <Navigate to="/" replace />;
  }

  // 로그인 되어 있음 → 자식 컴포넌트 렌더
  return children;
};

export default ProtectedRoute;
