import { Link } from "react-router-dom";
import { api } from "@/services/api/Api";

const EntryPage = () => {
  const googleLogin = async () => {
    api.get("/auth/google");
  };
  return (
    <div>
      <nav className="flex gap-4 p-4 bg-gray-300">
        <Link to="/solving">문제 풀이</Link>
        <Link to="/analysis/1">풀이 분석</Link>
        <Link to="/problem-select/">문제 선택</Link>

        {/* 임시로 submissionId 1번으로 넣어놨어요 */}
        <Link to="/review">오답노트</Link>
        <Link to="/review-list">오답노트 리스트</Link>

        {/* 임시로 submissionId 1번으로 넣어놨어요 */}
        <Link to="/review">오답노트</Link>
        <Link to="/landing">랜딩</Link>
        <Link to="/my-report">마이페이지</Link>
      </nav>

      <button onClick={googleLogin} className="text-gray-700 display-large">
        구글로그인
      </button>
    </div>
  );
};

export default EntryPage;
