// ReviewNoteListPage.tsx
import { useState } from "react";
import NoteFolder from "@/components/reviewNoteList/NoteFolder";
import ReviewNoteItem from "@/components/reviewNoteList/ReviewNoteItem";
import { ReactComponent as UploadLight } from "@/assets/icons/UploadLight.svg";
import { ReactComponent as Tresh } from "@/assets/icons/Tresh.svg";

const ReviewNoteListPage = () => {
    const mockProblemData: Record<string, Record<string, { id: number; title: string; correctCount: number, totalCount: number }[]>> = {
        "공통 수학1": {
            "부등식": [
                { id: 1, title: "부등식 문제 1", correctCount: 0, totalCount: 2 },
                { id: 2, title: "부등식 문제 2", correctCount: 1, totalCount: 2 },
            ],
            "도형의 방정식": [
                { id: 3, title: "도형 문제 1", correctCount: 2, totalCount: 2 },
            ],
        },
        "공통 수학2": {
            "부등식": [
                { id: 4, title: "수학2 부등식 문제", correctCount: 0, totalCount: 2 },
            ],
        },
    };

  const reviewNoteList = [
    {
      chapter: "즐겨찾기",
      sections: [
        { title: "이승주의 오답 컬렉션", count: 3 },
        { title: "3월 모의고사", count: 9 },
        { title: "6월 모의고사", count: 11 },
        { title: "9월 모의고사", count: 2 },
      ],
    },
    {
      chapter: "공통 수학1",
      sections: [
        { title: "부등식", count: 9 },
        { title: "도형의 방정식", count: 11 },
        { title: "지수함수와 로그함수", count: 2 },
        { title: "삼각함수", count: 3 },
        { title: "2차 방정식", count: 7 },
      ],
    },
    {
      chapter: "공통 수학2",
      sections: [
        { title: "부등식", count: 9 },
        { title: "도형의 방정식", count: 11 },
        { title: "지수함수와 로그함수", count: 2 },
        { title: "삼각함수", count: 3 },
        { title: "2차 방정식", count: 7 },
      ],
    },
  ];

  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const tabs = ['정답률↑', '정답률↓', '미해결'];
  const [selected, setSelected] = useState('정답률');

  const handleSelectSection = (chapter: string, section: string) => {
    setSelectedChapter(chapter);
    setSelectedSection(section);
  };


  return (
    <div className="grid grid-cols-12 gap-x-4 py-[clamp(16px,2.33vh,28px)] h-screen">
      <div className="col-span-4 h-full border border-gray-200 rounded-[10px] py-4 px-3 flex flex-col gap-y-4 overflow-y-auto">
        {/* 동적으로 렌더링되는 단원들 */}
        {reviewNoteList.map((item) => (
          <NoteFolder
            key={item.chapter}
            chapter={item.chapter}
            sections={item.sections}
            onSelectSection={handleSelectSection}
          />
        ))}
      </div>

      <div className="col-span-8 h-full flex flex-col gap-y-5">
          {selectedChapter && selectedSection ? (
              <>
                <div className='flex items-center justify-between'>
                  <p className="headline-medium text-gray-700">
                      {selectedChapter} &gt; {selectedSection}
                  </p>
                  <div className="flex items-center gap-x-1">
                    <UploadLight />
                    <p className="caption-medium text-gray-700">문제 등록</p>
                  </div>
                </div>
                <div className="w-full flex justify-between">
                  <div className="flex items-center text-gray-700 gap-x-1">
                    <Tresh />
                    <p className="caption-medium">삭제하기</p>
                  </div>
                  <div className="flex overflow-hidden w-fit">
                    {tabs.map((tab, i) => (
                        <button
                        key={tab}
                        onClick={() => setSelected(tab)}
                        className={`px-9 py-2.5 body-small ${
                            selected === tab
                            ? 'text-primary-500 border border-primary-500 bg-white z-10'
                            : 'text-gray-200 border border-gray-200 bg-gray-100 z-0'
                        } ${i!==0?'-ml-px':''}`}
                        >
                        {tab}
                        </button>
                    ))}
                    </div>
                </div>
                <div className="flex flex-col gap-y-5">
                  <div className="flex items-center justify-between text-gray-700 body-medium pl-18 border-b-1 border-gray-300 pb-3">
                    <p>문항</p>
                    <p>정답 수/시도 수</p>
                  </div>
                  {(mockProblemData[selectedChapter]?.[selectedSection] ?? []).map((problem) => (
                    <ReviewNoteItem key={problem.id} problem={problem} />
                  ))}
                </div>
              </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <p className="text-gray-400 caption-medium">소단원을 선택해주세요.</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default ReviewNoteListPage;
