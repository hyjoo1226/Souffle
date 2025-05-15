<<<<<<< HEAD
// import { Link } from "react-router-dom";
=======
>>>>>>> fe-feature/222-googleOauth
import { useState } from "react";
import SideBar from "./layouts/SideBar";
import Router from "./routes/Router";
import { useLocation } from "react-router-dom";

function App() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const location = useLocation();

<<<<<<< HEAD
  const isLandingPage = location.pathname === "/landing";

  return (
    <>
      <SideBar
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
      />

      <div className="">
        <button
          onClick={() => setIsSideBarOpen(true)}
          className="fixed top-1/2 w-6 h-10 bg-white rounded-full shadow-md flex items-center justify-center"
        >
          <img src="/icons/sidebar-button.png" alt="메뉴 열기" className="" />
        </button>
      </div>
      {isSideBarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setIsSideBarOpen(false)}
        />
      )}

      <div className={isLandingPage ? "" : "page-wrapper"}>
        {/* 라우팅 영역 */}
=======
  const isLoginPage = location.pathname === "/";         // 로그인 페이지
  const isLandingPage = location.pathname === "/landing" // 소개 페이지

  const shouldHideSidebar = isLoginPage; // 로그인 페이지에서만 숨김
  const shouldUseWrapper = !isLandingPage; // 로그인/소개 페이지는 wrapper 미사용

  return (
    <>
      {/* 사이드바: 로그인 페이지에서는 숨김 */}
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
            <img src="/icons/sidebar-button.png" alt="메뉴 열기" />
          </button>

          {isSideBarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setIsSideBarOpen(false)}
            />
          )}
        </>
      )}

      {/* page-wrapper는 로그인/소개 페이지에서 제외 */}
      <div className={shouldUseWrapper ? "page-wrapper" : ""}>
>>>>>>> fe-feature/222-googleOauth
        <Router />
      </div>
    </>
  );
}

export default App;
