// import { Link } from "react-router-dom";
import { useState } from "react";
import SideBar from "./layouts/sidebar";
import Router from "./routes/Router";

function App() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

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

      <div className="page-wrapper">
        {/* 라우팅 영역 */}
        <Router />
      </div>
    </>
  );
}

export default App;
