import { useState } from "react";
import { Folder } from "@/services/api/ReviewNoteList"; // 🔁 실제 타입 import
import { Button } from "../common/Button";
import {
  createFolderApi,
  moveToFavFolderApi,
} from "@/services/api/ReviewNoteList";
interface Props {
  favoriteFolders: Folder[];
  selectedProblemIds: number[];
  setFavoriteFolders: (folders: Folder[]) => void;
  setIsFavoriteModalOpen: (isOpen: boolean) => void;
  reviewNoteList: any[] | null;
  setReviewNoteList: (reviewNoteList: any) => void;
  handleSelectUnit: (unit: any) => void;
}

const FolderSelectModal = ({
  favoriteFolders,
  selectedProblemIds,
  setFavoriteFolders,
  setIsFavoriteModalOpen,
  reviewNoteList,
  setReviewNoteList,
  handleSelectUnit,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFavId, setSelectedFavId] = useState<number | undefined>(
    undefined
  );
  const [selectedFavName, setSelectedFavName] = useState<string>("");
  console.log("favoriteFolders", favoriteFolders);

  const handleModalOpen = () => setIsOpen(!isOpen);
  const handleCreateFolder = async (folderName: string) => {
    console.log("🆕 새 폴더 생성:", folderName);
    const data = {
      name: folderName,
      type: 1,
      parent_id: null,
    };

    const res = await createFolderApi(data);
    const newFolderId = res.id;

    const newFolder: Folder = {
      id: newFolderId,
      name: folderName,
      type: 1,
      parent_id: 1,
      children: [],
    };

    const updated = [...favoriteFolders];
    updated[0] = {
      ...updated[0],
      children: [...updated[0].children, newFolder], // ✅ 하위에 추가
    };
    setSelectedFavId(newFolderId);
    setFavoriteFolders(updated);
  };

  const handleFolderSelect = (folder: Folder) => {
    setSelectedFavName(folder.name);
    setSelectedFavId(folder.id);
    setIsOpen(false);
    console.log("여기", selectedFavId);
  };

  const handleMoveToFolder = async () => {
    if (!selectedFavId || selectedProblemIds.length === 0) return;

    // 실제 API 이동 호출 (주석 해제 필요)
    // await Promise.all(
    //   selectedProblemIds.map((problemId) =>
    //     moveToFavFolderApi(problemId, selectedFavId, 1)
    //   )
    // );

    const movedProblems =
      reviewNoteList?.filter((item) =>
        selectedProblemIds.includes(item.problem_id)
      ) || [];

    console.log("movedProblems", movedProblems);
    console.log("reviewNoteList", reviewNoteList);

    const updated = [...favoriteFolders];
    const targetFolderIndex = updated[0].children.findIndex(
      (folder) => folder.id === selectedFavId
    );

    if (targetFolderIndex !== -1) {
      updated[0].children[targetFolderIndex] = {
        ...updated[0].children[targetFolderIndex],
        problem_count:
          (updated[0].children[targetFolderIndex].problem_count || 0) +
          movedProblems.length,
        children: [
          ...(updated[0].children[targetFolderIndex].children || []),
          ...movedProblems,
        ],
      };

      setFavoriteFolders(updated);
    }

    setReviewNoteList(
      (prev: any[] | null) =>
        prev?.filter((item) => !selectedProblemIds.includes(item.problem_id)) ??
        null
    );
    const selectedChapter = "즐겨찾기";
    const selectedSection = selectedFavName; // Replace with the actual value or logic to retrieve the section
    const selectedUnit = null; // Replace with the actual value or logic to retrieve the unit
    const selectedType = 1; // Replace with the actual value or logic to retrieve the type
    const selectedFolderId = selectedFavId; // Replace with the actual value or logic to retrieve the folder ID

    await handleSelectUnit({
      chapter: selectedChapter,
      section: selectedSection,
      unit: selectedUnit,
      type: selectedType,
      id: selectedFolderId,
    });

    setIsOpen(false);
    setIsFavoriteModalOpen(false);
  };

  return (
    <div className="w-[480px] bg-white rounded shadow-lg px-3.5 py-3 flex flex-col gap-42">
      {/* 상단 드롭다운 or 입력창 */}
      {isCreatingFolder ? (
        <div className="flex items-center gap-2   w-full h-12">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="새 폴더 이름"
            className="flex-1 h-full px-3 border border-gray-200 rounded-[4px] text-sm text-gray-700"
          />
          <button
            onClick={() => handleCreateFolder(newFolderName)}
            className="h-full px-4 bg-primary-500 text-white rounded-[4px] text-sm"
          >
            추가
          </button>
        </div>
      ) : (
        <div className="relative flex items-center gap-2 h-12 w-full">
          <div
            className=" relative flex items-center justify-between w-full h-full px-3 bg-gray-100 rounded-[4px] cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <p
              className={`text-sm ${
                selectedFavName ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {selectedFavName || "문제를 저장할 즐겨찾기 폴더를 선택해주세요"}
            </p>
            <img src="/icons/down.png" className="w-4 h-4" />
          </div>
          <img
            src="/icons/add-square.png"
            alt="폴더 추가"
            className="w-9 h-9 cursor-pointer"
            onClick={() => setIsCreatingFolder(true)}
          />

          {/* 드롭다운 영역 */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-full z-50 bg-white border border-gray-200 rounded max-h-64 overflow-y-auto">
              {favoriteFolders.length > 0 ? (
                favoriteFolders[0].children.map((folder) => (
                  <div
                    key={folder.id}
                    className="px-4 py-3 hover:bg-primary-100 cursor-pointer body-small text-gray-700"
                    onClick={() => handleFolderSelect(folder)}
                  >
                    {folder.name}
                  </div>
                ))
              ) : (
                <p className="px-4 py-3 text-gray-400 text-sm">
                  저장할 폴더가 없습니다.
                </p>
              )}
            </div>
          )}
        </div>
      )}
      {/* 하단 버튼 */}
      <div className="flex justify-end gap-4 mt-4">
        <button
          className="px-4 py-2 border border-gray-300 text-sm rounded-[4px] text-gray-500"
          onClick={() => {
            setIsOpen(false);
            setIsCreatingFolder(false);
            setNewFolderName("");
            setIsFavoriteModalOpen(false);
          }}
        >
          취소
        </button>
        <button
          className="px-4 py-2 bg-primary-500 text-white text-sm rounded-[4px]"
          onClick={handleMoveToFolder}
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default FolderSelectModal;
