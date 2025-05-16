import ProblemCategory from "@/components/problemSelect/ProblemCategory";
import UnitReport from "@/components/problemSelect/UnitReport";
import { useEffect, useState } from "react";

// import {
//   getProblemListApi,
//   // getAllCategoriesApi,
// } from "@/services/api/ProblemSolving";
import LearningStatusChart from "@/components/problemSelect/LearningStatusChart";
import { dummyCategoryData, dummyProblemList } from "@/mocks/dummyCategoryData"; // 더미 데이터 임포트
import { useNavigate } from "react-router-dom";

const ProblemSelectPage = () => {
  const [categoryData, setCategoryData] = useState<any[]>([]); // 카테고리 데이터 상태
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [selectedLessonName, setSelectedLessonName] = useState<string | null>(
    null
  );

  // 선택된 카테고리 ID 상태
  const [problemList, setProblemList] = useState<any[]>([]); // 문제 리스트 상태
  const [progressRate, setProgressRate] = useState<number | null>(null); // 진도율 상태
  const [accuracyRate, setAccuracyRate] = useState<number>(0); // 정답률 상태
  const [sortType, setSortType] = useState<
    "default" | "accuracy-asc" | "accuracy-desc" | "unsolved"
  >("default");

  const sortedProblemList = [...problemList].sort((a, b) => {
    switch (sortType) {
      case "accuracy-desc":
        return b.problem_avg_accuracy - a.problem_avg_accuracy;
      case "accuracy-asc":
        return a.problem_avg_accuracy - b.problem_avg_accuracy;
      case "unsolved":
        return (a.correct_count >= 1 ? 1 : 0) - (b.correct_count >= 1 ? 1 : 0);
      case "default":
      default:
        return a.inner_no - b.inner_no;
    }
  });

  // const [categoryId, setCategoryId] = useState<number>(1); // 카테고리 ID 상태
  const navigate = useNavigate();
  const fetchProblemList = async () => {
    // if (selectedLessonId !== null) {
    //   const res = await getProblemListApi(selectedLessonId); // 문제 리스트 요청
    // }
    const problem = dummyProblemList[0].problem;
    const learningStatus = dummyProblemList[0].user;

    setProblemList(problem); // 문제 리스트 상태 업데이트
    setProgressRate(learningStatus.progress_rate); // 진도율 상태 업데이트
    setAccuracyRate(learningStatus.accuracy); // 정답률 상태 업데이트
    console.log("problemList", problem); // 클릭한 카테고리 ID 출력
    console.log("accuracyRate", accuracyRate); // 클릭한 카테고리 ID 출력
  };

  useEffect(() => {
    if (selectedLessonId) {
      fetchProblemList(); // 카테고리 ID가 있을 때만 문제 리스트 요청
    }
  }, [selectedLessonId]); // selectedLessonId가 변경될 때마다 실행

  const handleCategoryClick = async () => {
    // const res = await getAllCategoriesApi();
    const res = dummyCategoryData; // 더미 데이터 사용
    console.log("카테고리 데이터", res); // 카테고리 데이터 출력
    setCategoryData(res); // 카테고리 데이터 상태 업데이트
  };

  const handleProblemClick = async (problemId: number) => {
    console.log("문제 클릭", problemId);
    navigate(
      `/solving/${problemId}` // 문제 풀이 페이지로 이동
    );
  };

  useEffect(() => {
    handleCategoryClick();
  }, []); // 컴포넌트 마운트 시 카테고리 데이터 요청

  return (
    <div className="h-screen grid grid-cols-12 py-5 gap-x-4 ">
      <div className="col-span-5 flex flex-col gap-4 h-full">
        <div className="flex flex-col gap-5">
          <ProblemCategory
            categoryData={categoryData}
            selectedLessonId={selectedLessonId}
            setSelectedLessonId={setSelectedLessonId}
            selectedLessonName={selectedLessonName}
            setSelectedLessonName={setSelectedLessonName}
          />
          {/* 진도율, 정답률 차트 */}
          {selectedLessonId !== null && (
            <div className="flex flex-col border border-gray-200 rounded-[10px] px-4.5 py-7 gap-17">
              <p className="headline-medium text-gray-700">단원별 학습 현황</p>
              <div className="flex items-center justify-center gap-15">
                {progressRate !== null && accuracyRate !== null && (
                  <div className="flex flex-col gap-3 items-center">
                    <p className="headline-small text-gray-700">단원 학습율</p>
                    <LearningStatusChart selectedData={progressRate} />
                  </div>
                )}
                {progressRate !== null && accuracyRate !== null && (
                  <div className="flex flex-col gap-3 items-center">
                    <p className="headline-small text-gray-700">단원 정답률</p>
                    <LearningStatusChart selectedData={accuracyRate} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {selectedLessonId !== null && (
          <div className="flex-1">
            <UnitReport />
          </div>
        )}
      </div>
      <div className="flex flex-col col-span-7 gap-5">
        {/* 테이블헤더 */}
        <div className="flex px-4 py-4 h-13  border-b border-gray-200 ">
          <div className="basis-4/7 flex justify-center items-center">
            <p className="body-medium text-gray-700">문항</p>
          </div>
          <div className="basis-2/7 flex justify-center items-center">
            <p className="body-medium text-gray-700">정답 수/시도 수</p>
          </div>
          <div className="basis-1/7 flex justify-center items-center">
            <p className="body-medium text-gray-700">전체 정답률</p>
          </div>
        </div>
        {/* 문제 리스트 */}
        <div className="flex flex-col h-screen overflow-y-auto">
          <div className="flex justify-end">
            <div className="flex body-small text-gray-700 w-60">
              <p
                onClick={() => setSortType("accuracy-desc")}
                className={`flex justify-center flex-1 py-2.5 px-3.5 bg-gray-100 border border-gray-200 cursor-pointer ${
                  sortType === "accuracy-desc"
                    ? "bg-white text-primary-500 border-primary-500"
                    : ""
                }`}
              >
                정답률↑
              </p>
              <p
                onClick={() => setSortType("accuracy-asc")}
                className={`flex justify-center flex-1 py-2.5 px-3.5 bg-gray-100 border border-gray-200 cursor-pointer ${
                  sortType === "accuracy-asc"
                    ? "bg-white font-bold text-primary-500 border-primary-500"
                    : ""
                }`}
              >
                정답률↓
              </p>
              <p
                onClick={() => setSortType("unsolved")}
                className={`flex justify-center flex-1 py-2.5 px-3.5 bg-gray-100 border border-gray-200 cursor-pointer ${
                  sortType === "unsolved"
                    ? "bg-white font-bold text-primary-500 border-primary-500"
                    : ""
                }`}
              >
                미해결
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sortedProblemList.map((problem, index) => (
              <div key={index} className="flex px-4 py-4 mt-4 ">
                <div className="basis-4/7 flex pl-12 justify-items-start items-center gap-1.5">
                  <p
                    className="body-medium text-gray-700"
                    onClick={() => handleProblemClick(problem.problem_id)}
                  >
                    {`${selectedLessonName} ${problem.inner_no}번 문제`}
                  </p>
                  <div
                    className={`rounded-[8px] px-1.5 py-1 caption-small ${
                      problem.correct_count >= 1
                        ? "bg-primary-500 text-white"
                        : "bg-unsolved text-white"
                    }`}
                  >
                    {problem.correct_count >= 1 ? "해결" : "미해결"}
                  </div>
                </div>
                <div className="basis-2/7 flex justify-center items-center">
                  <p className="body-medium text-gray-700">{`${problem.correct_count} / ${problem.try_count}`}</p>
                </div>
                <div className="basis-1/7 flex justify-center items-center">
                  <p className="body-medium text-gray-700">{`${
                    problem.problem_avg_accuracy * 100
                  }%`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSelectPage;
