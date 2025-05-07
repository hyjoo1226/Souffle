import ProblemCategory from "@/components/problemSelect/ProblemCategory";
import UnitReport from "@/components/problemSelect/UnitReport";
// import { useEffect, useState } from "react";
// import { getProblemListApi } from "@/services/api/ProblemSolving";

const ProblemSelectPage = () => {
  // const [categoryId, setCategoryId] = useState<number>(1); // 카테고리 ID 상태

  // const fetchProblemList = async () => {
  //   console.log(categoryId); // 카테고리 ID 출력
  //   const res = await getProblemListApi(categoryId); // 문제 리스트 요청
  // };

  // useEffect(() => {
  //   fetchProblemList(); // 컴포넌트 마운트 시 문제 리스트 요청
  // }, [categoryId]);

  const problems = [
    {
      title: "부등식의 활용 6번 문제",
      status: "해결",
      attempts: "1 / 3",
      accuracy: "70%",
    },
    {
      title: "부등식의 활용 6번 문제",
      status: "해결",
      attempts: "1 / 3",
      accuracy: "70%",
    },
    {
      title: "부등식의 활용 6번 문제",
      status: "해결",
      attempts: "1 / 3",
      accuracy: "70%",
    },
    {
      title: "부등식의 활용 6번 문제",
      status: "해결",
      attempts: "1 / 3",
      accuracy: "70%",
    },
    {
      title: "부등식의 활용 6번 문제",
      status: "해결",
      attempts: "1 / 3",
      accuracy: "70%",
    },
    {
      title: "부등식의 활용 6번 문제",
      status: "해결",
      attempts: "1 / 3",
      accuracy: "70%",
    },
    {
      title: "부등식의 활용 6번 문제",
      status: "해결",
      attempts: "1 / 3",
      accuracy: "70%",
    },
    {
      title: "부등식의 활용 6번 문제",
      status: "해결",
      attempts: "1 / 3",
      accuracy: "70%",
    },
    {
      title: "부등식의 활용 6번 문제",
      status: "해결",
      attempts: "1 / 3",
      accuracy: "70%",
    },

    // ...더 많은 문제들
  ];

  return (
    <div className="grid grid-cols-12 py-5  gap-x-4  h-screen">
      <div className="col-span-5">
        <ProblemCategory />
        <UnitReport />
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
          {problems.map((problem, index) => (
            <div key={index} className="flex px-4 py-4">
              <div className="basis-4/7 flex pl-12 justify-items-start items-center gap-1.5">
                <p className="body-medium text-gray-700">{problem.title}</p>
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
