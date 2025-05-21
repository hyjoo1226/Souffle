import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      login(token); // context + localStorage 저장
      navigate("/my-report", { replace: true }); // 로그인 성공 시 이동
    } else {
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
      navigate("/landing", { replace: true });
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <p className="text-gray-700 body-medium">로그인 처리 중입니다...</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
