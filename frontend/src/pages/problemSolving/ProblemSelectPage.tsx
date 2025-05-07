import ProblemCategory from "@/components/problemSelect/ProblemCategory";
import UnitReport from "@/components/problemSelect/UnitReport";
import { useEffect, useState } from "react";
import {
  getProblemListApi,
  // getAllCategoriesApi,
} from "@/services/api/ProblemSolving";
import { dummyCategoryData, dummyProblemList } from "@/mocks/dummyCategoryData"; // 더미 데이터 임포트

const ProblemSelectPage = () => {
  const [categoryData, setCategoryData] = useState<any[]>([]); // 카테고리 데이터 상태
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [problemList, setProblemList] = useState<any[]>([]); // 문제 리스트 상태
  const [progressRate, setProgressRate] = useState<number>(0); // 진도율 상태
  const [accuracyRate, setAccuracyRate] = useState<number>(0); // 정답률 상태

  // const [categoryId, setCategoryId] = useState<number>(1); // 카테고리 ID 상태

  const fetchProblemList = async () => {
    // if (selectedLessonId !== null) {
    //   const res = await getProblemListApi(selectedLessonId); // 문제 리스트 요청
    // }
    const problem = dummyProblemList[0].problem;
    const learningStatus = dummyProblemList[0].user;

    setProblemList(problem); // 문제 리스트 상태 업데이트
    setProgressRate(learningStatus.progress_rate); // 진도율 상태 업데이트
    setAccuracyRate(learningStatus.accuracy); // 정답률 상태 업데이트
    console.log("문제 리스트", learningStatus); // 클릭한 카테고리 ID 출력
  };

  useEffect(() => {
    if (selectedLessonId) {
      fetchProblemList(); // 카테고리 ID가 있을 때만 문제 리스트 요청
    }
  }, [selectedLessonId]); // selectedLessonId가 변경될 때마다 실행

  const handleCategoryClick = async () => {
    // const res = await getAllCategoriesApi();
    const res = dummyCategoryData; // 더미 데이터 사용
    // console.log("카테고리 데이터", res); // 카테고리 데이터 출력
    setCategoryData(res); // 카테고리 데이터 상태 업데이트
  };

  useEffect(() => {
    handleCategoryClick();
  }, []); // 컴포넌트 마운트 시 카테고리 데이터 요청

  return (
    <div className="h-screen grid grid-cols-12 py-5 gap-x-4 ">
      <div className="col-span-5 flex flex-col gap-4 h-full">
        <div className="flex-1">
          <ProblemCategory
            categoryData={categoryData}
            selectedLessonId={selectedLessonId}
            setSelectedLessonId={setSelectedLessonId}
          />
        </div>
        <div className="flex-1">
          <UnitReport />
        </div>
      </div>
      <div className="col-span-7">
        {/* 테이블헤더 */}
        <div className="flex px-4 py-4 h-13  border-b border-gray-200">
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
        <div className="flex flex-col gap-9">
          {problemList.map((problem, index) => (
            <div key={index} className="flex px-4 py-4">
              <div className="basis-4/7 flex pl-12 justify-items-start items-center gap-1.5">
                <p className="body-medium text-gray-700">문항</p>
                <div className="bg-primary-500 rounded-[8px] px-1.5 py-1 caption-small">
                  해결
                </div>
              </div>
              <div className="basis-2/7 flex justify-center items-center">
                <p className="body-medium text-gray-700">1 / 3</p>
              </div>
              <div className="basis-1/7 flex justify-center items-center">
                <p className="body-medium text-gray-700">70%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProblemSelectPage;
