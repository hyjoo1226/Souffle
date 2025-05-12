// import { Link } from "react-router-dom";
import { useState } from "react";
import SideBar from "./layouts/SideBar";
import Router from "./routes/Router";
import { useLocation } from "react-router-dom";

function App() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const location = useLocation();

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
        <Router />
      </div>
    </>
  );
}

export default App;
