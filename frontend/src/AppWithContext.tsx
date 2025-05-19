import { useState, useEffect } from "react";
import SideBar from "./layouts/SideBar";
import Router from "./routes/Router";
import { useLocation } from "react-router-dom";
import { isLoggedIn } from "@/utils/auth";
import { getUserInfoApi } from "@/services/api/User";
import { useUser } from "@/contexts/UserContext";
import 'katex/dist/katex.min.css';

function AppWithContext() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const location = useLocation();
  const { setUser } = useUser(); // 이제 안전하게 사용 가능!

  const isLoginPage = location.pathname === "/";
  const isLandingPage = location.pathname === "/landing";

  const shouldHideSidebar = isLoginPage;
  const shouldUseWrapper = !isLandingPage;

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!isLoggedIn()) return;
        const data = await getUserInfoApi();
        setUser(data);
      } catch (error) {
        console.error("유저 정보 불러오기 실패", error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <>
      {!shouldHideSidebar && (
        <>
          <SideBar
            isSideBarOpen={isSideBarOpen}
            setIsSideBarOpen={setIsSideBarOpen}
          />

          <button
            onClick={() => setIsSideBarOpen(true)}
            className="fixed z-40 top-1/2 w-6 h-10 bg-white rounded-full shadow-md flex items-center justify-center"
          >
            <img src="/icons/navButton.png" alt="메뉴 열기" />
          </button>

          {isSideBarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setIsSideBarOpen(false)}
            />
          )}
        </>
      )}

      <div className={shouldUseWrapper ? "page-wrapper" : ""}>
        <Router />
      </div>
    </>
  );
}

export default AppWithContext;
