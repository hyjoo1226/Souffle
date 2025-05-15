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
  deleteProblemApi,
  UnitSelectPayload,
} from "@/services/api/ReviewNoteList";
import {
  mockFavoriteFolderData,
  mockReviewNoteFolderData,
  mockType1ListData,
  mockType2ListData,
} from "@/mocks/dummyReviewData";

const ReviewNoteListPage = () => {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);

  const tabs = ["정답률↑", "정답률↓", "미해결"];
  const [selected, setSelected] = useState("정답률↑");
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [reviewNoteList, setReviewNoteList] = useState<ReviewNoteList | null>(
    null
  );

  // const [checkedProblemList, setCheckedProblemList] = useState<number[]>([]);

  const handleSelectUnit = async ({
    chapter,
    section,
    type,
    unit,
    id,
  }: UnitSelectPayload) => {
    // console.log("chapter", chapter);

    setSelectedChapter(chapter);
    setSelectedSection(section);
    setSelectedType(type);
    setSelectedUnit(unit);

    console.log("chapter", selectedChapter);
    console.log("section", section);
    console.log("type", type);
    console.log("unit", unit);
    console.log("id", id);
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

  const handleClickDelete = () => {
    const confirmed = window.confirm("선택한 문제를 삭제하시겠습니까?");
    if (confirmed) {
      console.log("selectedProblemIds", selectedProblemIds);
      console.log("selectedType", selectedType);

      if (!reviewNoteList) return;
      if (selectedType !== null) {
        selectedProblemIds.map((selectedProblemId) => {
          // deleteProblemApi(selectedProblemId, selectedType);
        });
      }

      const updatedList = reviewNoteList.filter(
        (item) => !selectedProblemIds.includes(item.problem_id)
      );

      setReviewNoteList(updatedList);
      setSelectedProblemIds([]); // 선택 초기화
    }
  };

  // const handleClickFolderChange = () => {
  //   selectedProblemIds.map((selectedProblemId)=> {

  //   })
  // }

  const handleDropProblemToSection = (targetSection: string) => {
    console.log("이동할 문제들:", selectedProblemIds);
    console.log("타겟 소단원:", targetSection);
    // 일단 드래그 앤 드랍으로 문제 이동하는 기능은 구현했으나 태블릿 환경에 적합한지는 의문
    // 고도화 할 기회가 있다면 논의 후 폴더 이동 버튼 구현

    // TODO: 여기에 백엔드 요청 붙이면 됨
    // ex: axios.post("/api/move", { problemIds: selectedProblemIds, target: targetSection })
  };
  const [noteFolders, setNoteFolders] = useState<Folder[] | null>(null);
  const [favoriteFolders, setFavoriteFolders] = useState<Folder[] | null>(null);
  const fetchFolderList = async () => {
    // const favRes = await getFavoriteFoldersApi();
    // const ReviewRes = await getReviewNoteFolderApi();
    // const favoriteRes = favRes[0];
    // const reviewNoteRes = ReviewRes[0];

    const favoriteRes = mockFavoriteFolderData[0];
    const reviewNoteRes = mockReviewNoteFolderData;

    setFavoriteFolders([favoriteRes]);
    setNoteFolders(reviewNoteRes);
    // const merged = [favoriteRes, ...reviewNoteRes]; // 하나의 배열로 합치기
    // setNoteFolders(merged);
    console.log("favoriteFolders", favoriteFolders);
    console.log("noteFolders", noteFolders);
  };

  useEffect(() => {
    fetchFolderList();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-x-4 py-[clamp(16px,2.33vh,28px)] h-screen">
      <div className="col-span-4 h-full border border-gray-200 rounded-[10px] py-4 px-3 flex flex-col gap-y-4 overflow-y-auto">
        {/* 동적으로 렌더링되는 단원들 */}
        {favoriteFolders?.map((item) => (
          <NoteFolder
            key={item.id}
            chapter={item.name}
            sections={item.children}
            type={item.type}
            favoriteFolders={favoriteFolders}
            setFavoriteFolders={setFavoriteFolders}
            onSelectUnit={handleSelectUnit}
            onDropProblem={handleDropProblemToSection}
          />
        ))}
        {noteFolders?.map((item) => (
          <NoteFolder
            key={item.id}
            chapter={item.name}
            sections={item.children}
            type={item.type}
            favoriteFolders={favoriteFolders}
            setFavoriteFolders={setFavoriteFolders}
            onSelectUnit={handleSelectUnit}
            onDropProblem={handleDropProblemToSection}
          />
        ))}
      </div>

      <div className="col-span-8 h-full flex flex-col gap-y-5">
        {selectedSection && selectedUnit ? (
          <>
            <div className="flex items-center justify-between">
              <p className="headline-medium text-gray-700">
                {selectedChapter} &gt; {selectedSection} &gt; {selectedUnit}
              </p>
              <div className="flex items-center gap-x-1">
                <UploadLight />
                <p className="caption-medium text-gray-700">문제 등록</p>
              </div>
            </div>
            <div className="w-full flex justify-between">
              <div
                className="flex items-center text-gray-700 gap-x-1"
                onClick={handleClickDelete}
              >
                <Trash />
                <p className="caption-medium">삭제하기</p>
              </div>
              <div
                className="flex items-center text-gray-700 gap-x-1"
                // onClick={handleClickFolderChange}
              >
                <Trash />
                <p className="caption-medium">즐겨찾기 추가</p>
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
