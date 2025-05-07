import { CategoryProps } from "../../types/ProblemSolving";
import { useEffect, useState } from "react";

const AccordianList = ({
  categoryData,
  selectedLessonId,
  setSelectedLessonId,
}: CategoryProps) => {
  const [openSubjectId, setOpenSubjectId] = useState<number[]>([]);
  const [openUnitId, setOpenUnitId] = useState<number[]>([]);

  const handleSubjectClick = (id: number) => {
    setOpenSubjectId((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleUnitClick = (id: number) => {
    setOpenUnitId((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleLessonClick = (lessonId: number) => {
    setSelectedLessonId(lessonId); // 선택된 소단원 ID 설정
    console.log(lessonId); // 선택된 소단원 ID 출력
    console.log(selectedLessonId); // 선택된 소단원 ID 상태 출력
  };
  useEffect(() => {
    console.log(selectedLessonId); // 열려 있는 대단원 ID 출력
    console.log(openUnitId); // 열려 있는 중단원 ID 출력
  }, [selectedLessonId]);

  return (
    <div>
      <div className="border border-gray-200 rounded-[20px]">
        {categoryData.map((subject) => (
          <div key={subject.id}>
            {/* 대단원 */}
            <div
              className="headline-small px-4 py-4.5 text-gray-700 flex items-center justify-between cursor-pointer"
              onClick={() => handleSubjectClick(subject.id)}
            >
              {subject.name}
              <img src="/icons/down.png" alt="" className="w-9 h-9" />
            </div>

            {/* 중단원: 대단원이 열렸을 때만 */}
            {openSubjectId.includes(subject.id) &&
              subject.children.map((unit, unitIndex) => (
                <div key={unit.id}>
                  <div
                    className="body-medium px-4 pl-12 py-4.5 text-gray-700 flex items-center justify-between cursor-pointer"
                    onClick={() => handleUnitClick(unit.id)}
                  >
                    {`${unitIndex + 1}. ${unit.name}`}
                    <img src="/icons/down.png" alt="" className="w-9 h-9" />
                  </div>

                  {/* 소단원: 중단원이 열렸을 때만 */}
                  {openUnitId.includes(unit.id) &&
                    unit.children.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson.id)}
                        className={`body-medium px-4 pl-20 py-4.5 text-gray-700 flex items-center justify-between cursor-pointer rounded-md transition-colors duration-200 ${
                          selectedLessonId === lesson.id ? "bg-blue-200" : ""
                        }`}
                      >
                        {`${unitIndex + 1}-${lessonIndex + 1}. ${lesson.name}`}
                      </div>
                    ))}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccordianList;
