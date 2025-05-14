// ReviewNoteListPage.tsx
import { useState, useEffect, use } from "react";
import NoteFolder from "@/components/reviewNoteList/NoteFolder";
import ReviewNoteItem from "@/components/reviewNoteList/ReviewNoteItem";
import { ReactComponent as UploadLight } from "@/assets/icons/UploadLight.svg";
import { ReactComponent as Trash } from "@/assets/icons/Trash.svg";
import {
  getFavoriteFoldersApi,
  getReviewNoteFolderApi,
  getProblemListApi,
  Folder,
  ReviewNoteList,
} from "@/services/api/ReviewNoteList";
import {
  mockFavoriteFolderData,
  mockReviewNoteFolderData,
  mockType1ListData,
  mockType2ListData,
} from "@/mocks/dummyReviewData";

const ReviewNoteListPage = () => {
  const mockProblemData: Record<
    string,
    Record<
      string,
      { id: number; title: string; correctCount: number; totalCount: number }[]
    >
  > = {
    "공통 수학1": {
      부등식: [
        { id: 1, title: "부등식 문제 1", correctCount: 0, totalCount: 2 },
        { id: 2, title: "부등식 문제 2", correctCount: 1, totalCount: 2 },
      ],
      "도형의 방정식": [
        { id: 3, title: "도형 문제 1", correctCount: 2, totalCount: 2 },
      ],
    },
    "공통 수학2": {
      부등식: [
        { id: 4, title: "수학2 부등식 문제", correctCount: 0, totalCount: 2 },
      ],
    },
  };

  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);

  const tabs = ["정답률↑", "정답률↓", "미해결"];
  const [selected, setSelected] = useState("정답률↑");

  const handleSelectSection = async (
    chapter: string,
    section: string,
    type: number,
    id: number
  ) => {
    setSelectedChapter(chapter);
    setSelectedSection(section);
    setSelectedType(type);
    console.log("chapter", chapter);
    console.log("section", section);
    console.log("type", type);
    console.log("");
    // const res = await getProblemListApi(type, id);
    if (type == 1) {
      const res = mockType1ListData;
      setReviewNoteList(res);
    } else {
      const res = mockType2ListData;
      setReviewNoteList(res);
    }
  };

  const handleCheckboxToggle = (problemId: number) => {
    setSelectedProblemIds((prev) =>
      prev.includes(problemId)
        ? prev.filter((id) => id !== problemId)
        : [...prev, problemId]
    );
  };

  const handleDropProblemToSection = (targetSection: string) => {
    console.log("이동할 문제들:", selectedProblemIds);
    console.log("타겟 소단원:", targetSection);
    // 일단 드래그 앤 드랍으로 문제 이동하는 기능은 구현했으나 태블릿 환경에 적합한지는 의문
    // 고도화 할 기회가 있다면 논의 후 폴더 이동 버튼 구현

    // TODO: 여기에 백엔드 요청 붙이면 됨
    // ex: axios.post("/api/move", { problemIds: selectedProblemIds, target: targetSection })
  };

  const getFilteredAndSortedProblems = () => {
    const problems =
      selectedChapter && selectedSection
        ? mockProblemData[selectedChapter]?.[selectedSection] ?? []
        : [];

    if (selected === "미해결") {
      return problems.filter((p) => p.correctCount === 0);
    }

    return [...problems].sort((a, b) => {
      const rateA = a.totalCount === 0 ? 0 : a.correctCount / a.totalCount;
      const rateB = b.totalCount === 0 ? 0 : b.correctCount / b.totalCount;

      return selected === "정답률↑" ? rateA - rateB : rateB - rateA;
    });
  };

  //////////////////////////////////////////////////////////////////

  const [noteFolders, setNoteFolders] = useState<Folder[] | null>(null);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [reviewNoteList, setReviewNoteList] = useState<ReviewNoteList | null>(
    null
  );

  const fetchFolderList = async () => {
    // const favRes = await getFavoriteFoldersApi();
    // const ReviewRes = await getReviewNoteFolderApi();
    // const favoriteRes = favRes[0];
    // const reviewNoteRes = ReviewRes[0];
    const favoriteRes = mockFavoriteFolderData[0];
    const reviewNoteRes = mockReviewNoteFolderData[0];

    const merged = [favoriteRes, reviewNoteRes]; // 하나의 배열로 합치기
    setNoteFolders(merged);
    console.log(merged);
  };

  useEffect(() => {
    fetchFolderList();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-x-4 py-[clamp(16px,2.33vh,28px)] h-screen">
      <div className="col-span-4 h-full border border-gray-200 rounded-[10px] py-4 px-3 flex flex-col gap-y-4 overflow-y-auto">
        {/* 동적으로 렌더링되는 단원들 */}
        {noteFolders?.map((item) => (
          <NoteFolder
            key={item.id}
            chapter={item.name}
            sections={item.children}
            type={item.type}
            noteFolders={noteFolders}
            setNoteFolders={setNoteFolders}
            onSelectSection={handleSelectSection}
            onDropProblem={handleDropProblemToSection}
          />
        ))}
      </div>

      <div className="col-span-8 h-full flex flex-col gap-y-5">
        {selectedChapter && selectedSection ? (
          <>
            <div className="flex items-center justify-between">
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
                <Trash />
                <p className="caption-medium">삭제하기</p>
              </div>
              <div className="flex overflow-hidden w-fit">
                {/* 오답 리스트 정렬 버튼 */}
                {tabs.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setSelected(tab)}
                    className={`px-9 py-2.5 body-small ${
                      selected === tab
                        ? "text-primary-500 border border-primary-500 bg-white z-10"
                        : "text-gray-200 border border-gray-200 bg-gray-100 z-0"
                    } ${i !== 0 ? "-ml-px" : ""}`}
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
              {reviewNoteList?.map((problem) => (
                <ReviewNoteItem
                  key={problem.problem_id}
                  problem={problem}
                  isSelected={selectedProblemIds.includes(problem.problem_id)}
                  onToggle={() => handleCheckboxToggle(problem.problem_id)}
                  selectedProblemIds={selectedProblemIds}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <p className="text-gray-400 caption-medium">
              소단원을 선택해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewNoteListPage;
