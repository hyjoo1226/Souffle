import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ReactComponent as WhiteboardLogo } from '@/assets/icons/WhiteboardLogo.svg';
import { ReactComponent as GoogleIcon } from '@/assets/icons/GoogleIcon.svg';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/landing", { replace: true }); // 로그인 된 사용자는 강제 이동
    }
  }, [navigate])

  const width = 500;
  const height = 600;
  const left = window.screenX + (window.innerWidth - width) / 2;
  const top = window.screenY + (window.innerHeight - height) / 2;

  const handleGoogleLogin = () => {
    // 1) 팝업 띄우기
    const popup = window.open(
      "http://localhost:4000/api/v1/auth/google",
      'googleLogin',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,location=no,status=no`
    );

    // 2) 메시지 받을 리스너 등록
    const receiveMessage = (event: { origin: string; data: { access_token: any; refresh_token: any; user: any; }; }) => {
      if (event.origin !== window.location.origin) return;

      const { access_token, refresh_token, user } = event.data;
      // 3) 토큰 저장
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem("user", JSON.stringify(user));

      window.removeEventListener("message", receiveMessage);
      // 4) 팝업 닫고, 로그인 후 행동 (리다이렉트 등)
      if (popup) {
        popup.close();
      }
      window.location.href = '/landing';
    };

    window.addEventListener('message', receiveMessage, { once: true });
  };


  return (
    <div className="min-h-screen w-full flex flex-col gap-y-30 items-center justify-center bg-white">
      {/* 중앙 일러스트 */}
      <WhiteboardLogo />

      {/* 구글 로그인 버튼 */}
      <div className="w-full max-w-md">
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center border-1 border-gray-200 gap-3 py-3 px-4 rounded-[10px] text-gray-700 body-medium"
        >
          <GoogleIcon />
          구글 계정으로 시작하기
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
