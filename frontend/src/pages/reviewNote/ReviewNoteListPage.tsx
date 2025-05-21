// ReviewNoteListPage.tsx
import { useState, useEffect, useMemo } from "react";
import NoteFolder from "@/components/reviewNoteList/NoteFolder";
import ReviewNoteItem from "@/components/reviewNoteList/ReviewNoteItem";
// import { ReactComponent as UploadLight } from "@/assets/icons/UploadLight.svg";
import { ReactComponent as Trash } from "@/assets/icons/Trash.svg";
import { ReactComponent as Star } from "@/assets/icons/Star.svg";
import {
  getFavoriteFoldersApi,
  getReviewNoteFolderApi,
  getProblemListApi,
  Folder,
  ReviewNoteList,
  deleteProblemApi,
  UnitSelectPayload,
} from "@/services/api/ReviewNoteList";

import FolderSelectModal from "@/components/reviewNoteList/FolderSelectModal";
import ProblemPreview from "@/components/reviewNoteList/ProblemPreview";

const ReviewNoteListPage = () => {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const tabs = ["정답률↑", "정답률↓", "복습"];
  const [selected, setSelected] = useState("정답률↑");
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [reviewNoteList, setReviewNoteList] = useState<ReviewNoteList | null>(
    null
  );
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);

  const handleSelectUnit = async ({
    chapter,
    section,
    type,
    unit,
    id,
  }: UnitSelectPayload) => {
    setSelectedChapter(chapter);
    setSelectedSection(section);
    setSelectedType(type);
    setSelectedUnit(unit);

    if (type == 1) {
      // const res = mockType1ListData;
      const res = await getProblemListApi(1, id);
      setReviewNoteList(res);
      // console.log("선택폴더Id", id);
    } else {
      //
      const res = await getProblemListApi(2, id);
      setReviewNoteList(res);
      // console.log("선택폴더Id", id);
    }

    // console.log("노트리스트", reviewNoteList);
    setSelectedProblem(null);
  };
  const handleCheckboxToggle = (problemId: number) => {
    setSelectedProblemIds((prev) =>
      prev.includes(problemId)
        ? prev.filter((id) => id !== problemId)
        : [...prev, problemId]
    );
    // console.log(selectedProblemIds);
  };

  const handleClickProblem = (problemId: number) => {
    const found =
      reviewNoteList?.find((p) => p.problem_id === problemId) || null;
    setSelectedProblem(found);
  };

  const handleClickDelete = () => {
    const confirmed = window.confirm("선택한 문제를 삭제하시겠습니까?");
    if (confirmed) {
      if (!reviewNoteList) return;
      if (selectedType !== null) {
        selectedProblemIds.map((selectedProblemId) => {
          deleteProblemApi(selectedProblemId, selectedType);
        });
      }

      const updatedList = reviewNoteList.filter(
        (item) => !selectedProblemIds.includes(item.problem_id)
      );

      setReviewNoteList(updatedList);
      setSelectedProblemIds([]); // 선택 초기화
    }
  };

  const handleClickFolderChange = () => {
    setIsFavoriteModalOpen(!isFavoriteModalOpen);
  };

  const [noteFolders, setNoteFolders] = useState<Folder[] | null>(null);
  const [favoriteFolders, setFavoriteFolders] = useState<Folder[] | null>(null);

  const mergedFolders = useMemo(() => {
    return [
      {
        type: 1,
        folders: favoriteFolders ?? [],
        setFolders: setFavoriteFolders,
      },
      {
        type: 2,
        folders: noteFolders ?? [],
        setFolders: setNoteFolders,
      },
    ];
  }, [favoriteFolders, noteFolders]);

  const [topFavoriteFolderId, setTopFavoriteFolderId] = useState<number | null>(
    null
  );

  const fetchFolderList = async () => {
    const folderList: Folder[] = await getFavoriteFoldersApi();
    const reviewFolderList: Folder[] = await getReviewNoteFolderApi();
    // 즐겨찾기 폴더: type === 1, id 순 정렬
    const favoriteFolders = folderList
      .filter((f) => f.type === 1)
      .sort((a, b) => a.id - b.id);

    // 복습노트 폴더: type === 2, id 순 정렬
    const noteFolders = reviewFolderList
      .filter((f) => f.type === 2)
      .sort((a, b) => a.id - b.id);

    const topFolderId = folderList.find(
      (f) => f.type === 1 && f.parent_id === null
    )?.id;
    setTopFavoriteFolderId(topFolderId || null);
    setFavoriteFolders(favoriteFolders);
    setNoteFolders(noteFolders);
  };

  useEffect(() => {
    fetchFolderList();
  }, []);

  const sortedReviewNoteList = useMemo(() => {
    if (!reviewNoteList) return [];
    if (selected === "정답률↑") {
      return [...reviewNoteList].sort((a, b) => {
        const rateA = a.user.try_count ? a.user.correct_count / a.user.try_count : 0;
        const rateB = b.user.try_count ? b.user.correct_count / b.user.try_count : 0;
        return rateA - rateB;
      });
    }
    if (selected === "정답률↓") {
      return [...reviewNoteList].sort((a, b) => {
        const rateA = a.user.try_count ? a.user.correct_count / a.user.try_count : 0;
        const rateB = b.user.try_count ? b.user.correct_count / b.user.try_count : 0;
        return rateB - rateA;
      });
    }
    if (selected === "복습") {
      return reviewNoteList.filter(
        (item) => item.user.try_count > 0 && item.user.correct_count === 0
      );
    }
    return reviewNoteList;
  }, [reviewNoteList, selected]);


  return (
    <>
      <div className="grid grid-cols-12 gap-x-4 py-[clamp(16px,2.33vh,28px)] h-screen">
        <div className="col-span-4 h-full border border-gray-200 rounded-[10px] py-4 px-3 flex flex-col gap-y-4 overflow-y-auto">
          {mergedFolders.map(({ folders, setFolders, type }) =>
            folders.map((item) => (
              <NoteFolder
                key={item.id}
                chapter={item.name}
                sections={item.children}
                type={type}
                folders={folders}
                favoriteFolders={favoriteFolders}
                setFavoriteFolders={setFolders}
                onSelectUnit={handleSelectUnit}

                // onDropProblem={handleDropProblemToSection}
              />
            ))
          )}
        </div>

        <div className="col-span-8 h-full flex flex-col gap-y-5">
          {selectedChapter && selectedSection ? (
            <>
              <div className="flex items-center justify-between">
                <p className="headline-medium text-gray-700">
                  {selectedChapter} &gt; {selectedSection}
                  {selectedUnit && ` > ${selectedUnit}`}
                </p>
                {/* <div className="flex items-center gap-x-1">
                  <UploadLight />
                  <p className="caption-medium text-gray-700">문제 등록</p>
                </div> */}
              </div>
              <div className="w-full flex justify-between">
                <div className="flex gap-8 items-center">
                  <div
                    className="flex items-center text-gray-700 gap-x-1"
                    onClick={handleClickDelete}
                  >
                    <Trash />
                    <p className="caption-medium">삭제하기</p>
                  </div>
                  <div className="relative ">
                    <div
                      className="flex items-center gap-x-1"
                      onClick={handleClickFolderChange}
                    >
                      <Star className="text-gray-700" />
                      <p className="caption-medium text-gray-700">
                        즐겨찾기 추가
                      </p>
                    </div>

                    {isFavoriteModalOpen && (
                      <div className="absolute left-3 mt-2 w-fit  z-50">
                        <FolderSelectModal
                          favoriteFolders={favoriteFolders || []}
                          selectedProblemIds={selectedProblemIds}
                          setFavoriteFolders={setFavoriteFolders}
                          setIsFavoriteModalOpen={setIsFavoriteModalOpen}
                          reviewNoteList={reviewNoteList}
                          setReviewNoteList={setReviewNoteList}
                          handleSelectUnit={handleSelectUnit}
                          setSelectedProblemIds={setSelectedProblemIds}
                          topFavoriteFolderId={topFavoriteFolderId}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex overflow-hidden w-fit">
                  {/* 복습 리스트 정렬 버튼 */}
                  {tabs.map((tab, i) => (
                    <button
                      key={tab}
                      onClick={() => setSelected(tab)}
                      className={`px-9 py-2.5 body-small min-w-[123.09px] ${
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
              <div className="flex flex-col gap-y-5 flex-1">
                <div className="grid grid-cols-12 gap-x-4 text-gray-700 body-medium border-b border-gray-300 pb-3">
                  <div className="col-span-4 flex items-center justify-center">
                    <p>문항</p>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <p>정답 수/시도 수</p>
                  </div>
                  <div className="col-span-6 flex items-center justify-center">
                    <p>문제 미리 보기</p>
                  </div>
                </div>
                <div className="grid grid-cols-12 flex-1 min-h-0">
                  <div
                    className="col-span-6 flex flex-col overflow-y-auto"
                    style={{ maxHeight: "calc(100vh - 230px)" }}
                  >
                    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-5 justify-start">
                      {sortedReviewNoteList.map((problem) => (
                        <ReviewNoteItem
                          key={problem.problem_id}
                          problem={problem}
                          isSelected={selectedProblemIds.includes(
                            problem.problem_id
                          )}
                          onToggle={() =>
                            handleCheckboxToggle(problem.problem_id)
                          }
                          selectedProblemIds={selectedProblemIds}
                          handleClickProblem={handleClickProblem}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="col-span-6 ">
                    <ProblemPreview selectedProblem={selectedProblem} />
                  </div>
                </div>
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
    </>
  );
};

export default ReviewNoteListPage;
