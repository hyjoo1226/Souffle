import { Link } from "react-router-dom";

const EntryPage = () => {
  return (
    <nav className="flex gap-4 p-4 bg-gray-300">
      <Link to="/solving">문제 풀이</Link>
      <Link to="/analysis/1">풀이 분석</Link>
      <Link to="/problem-select/">문제 선택</Link>

      {/* 임시로 submissionId 1번으로 넣어놨어요 */}
      <Link to="/review">오답노트</Link>
      <Link to="/review-list">오답노트 리스트</Link>
    </nav>
  );
};

export default EntryPage;
