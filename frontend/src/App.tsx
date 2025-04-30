// import { Link } from "react-router-dom";
import Router from "./routes/Router";

function App() {
  return (
    <>
      {/* 공통 네비게이션 */}
      {/* <nav className="flex gap-4 p-4 bg-gray-300">
        <Link to="/solving">문제 풀이</Link>
        <Link to="/analysis">풀이 분석</Link>
      </nav> */}

      <div className="container">
        {/* 라우팅 영역 */}
        <Router />
      </div>
    </>
  );
}

export default App;
