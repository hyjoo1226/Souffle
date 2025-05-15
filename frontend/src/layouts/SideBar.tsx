import { useState } from "react";
import { Link } from "react-router-dom";

const SideBar = ({
    isSideBarOpen,
    setIsSideBarOpen,
  } : {
    isSideBarOpen: boolean;
    setIsSideBarOpen: (value: boolean) => void;
  }) => {
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null); // 기본 선택 없음
  const menuItems = [
    "메인",
    "문제 풀이",
    "오답 노트",
    "개념 학습",
    "내 학습 현황",
  ];
  const getPathFromMenu = (menu: string) => {
    switch (menu) {
      case "메인 페이지":
        return "/landing";
      case "문제 풀이":
        return "/problem-select";
      case "오답 노트":
        return "/review-list";
      case "개념 학습":
        return "/problem-select";
      case "내 학습 현황":
        return "/problem-select";
      default:
        return "/landing";
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 로그아웃 처리 함수
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div
      className={`flex flex-col fixed top-0 left-0 w-1/4 min-w-80 h-full bg-white shadow-lg z-50 transition-transform duration-300 ${
        isSideBarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* 상단 */}
      <div className="w-full bg-primary-100 pt-4 pb-5 px-4">
        <div className="flex justify-end mb-4">
          <div className="flex gap-1 w-fit h-fit border border-primary-500 px-2 py-1.5 rounded-[10px]">
            <p className="body-medium text-primary-500">1학년</p>
            <img
              src="/icons/down.png"
              alt="드롭다운 화살표"
              className="w-6 h-6"
            />
          </div>
        </div>
        <div className="flex gap-2.5 mb-5.5 items-center">
          <img
            src="/icons/plus.png"
            alt="프로필 이미지"
            className="w-10 h-10 rounded-full border border-gray-200"
          />
          <div className="flex-col">
            <p className="text-gray-700 body-medium-bold">{user.nickname || "등록된 닉네임이 없습니다."}</p>
            <p className="text-gray-500 body-small">{user.email ? user.email : "등록된 이메일이 없습니다."}</p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex gap-2 items-center cursor-pointer" onClick={handleLogout}>
            <img src="/icons/log-out.png" alt="로그아웃" className="w-6 h-6" />
            <p className="body-small text-gray-400">로그아웃</p>
          </div>
        </div>
      </div>
      {/* 하단 */}
      <div className="flex-1 mt-7">
        <div className="flex flex-col gap-6 w-full items-center py-3.5">
          {menuItems.map((menu) => (
            <Link
              to={getPathFromMenu(menu)}
              key={menu}
              onClick={() => {
                setSelectedMenu(menu);
                setIsSideBarOpen(false);
              }}
              className={`headline-small text-gray-700 text-start w-[90%] px-3 py-3.5 rounded-lg cursor-pointer transition hover:bg-primary-100
              ${selectedMenu === menu ? "bg-primary-100" : ""}
            `}
            >
              {menu}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-auto mb-6">
        <img src="/icons/souffle-logo.png" alt="로고" className="w-[75%]" />
      </div>
    </div>
  );
};

export default SideBar;
