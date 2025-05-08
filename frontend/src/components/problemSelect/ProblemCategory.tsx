import AccordianList from "./AccordionList";
import { CategoryProps } from "../../types/ProblemSolving";
import { useState } from "react";

const ProblemCategory = ({
  categoryData,
  selectedLessonId,
  setSelectedLessonId,
  setSelectedLessonName,
}: CategoryProps) => {
  const [categoryOpen, setCategoryOpen] = useState(false); // 카테고리 열기 상태
  // console.log(categoryData);
  const handleCategoryClick = () => {
    setCategoryOpen(!categoryOpen); // 카테고리 열기 상태 토글
  };
  return (
    <div className="relative flex flex-col gap-5">
      <div
        onClick={handleCategoryClick}
        className=" flex justify-between items-center border border-gray-200 px-4 py-2  rounded-[10px]"
      >
        <p className="body-medium text-gray-700">4. 부등식</p>
        <img src="/icons/down.png" alt="" className="w-9 h-9" />
      </div>
      {/* 아코디언 */}
      <div className="absolute z-50  top-15 left-0 shadow-lg rounded-[20px] bg-white w-full">
        {categoryOpen && (
          <AccordianList
            categoryData={categoryData}
            selectedLessonId={selectedLessonId}
            setSelectedLessonId={setSelectedLessonId}
            setSelectedLessonName={setSelectedLessonName}
          />
        )}
      </div>
    </div>
  );
};

export default ProblemCategory;
