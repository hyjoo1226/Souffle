import { Link } from "react-router-dom";

const EntryPage = () => {
  return (
    <nav className="flex gap-4 p-4 bg-gray-300">
      <Link to="/solving">문제 풀이</Link>
      <Link to="/analysis">풀이 분석</Link>
    </nav>
  );
};

export default EntryPage;
