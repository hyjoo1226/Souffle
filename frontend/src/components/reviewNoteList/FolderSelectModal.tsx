import { useState } from "react";
import { Folder } from "@/services/api/ReviewNoteList"; // 🔁 실제 타입 import
// import { Button } from "../common/Button";
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
  setSelectedProblemIds: (ids: number[]) => void;
  topFavoriteFolderId: number | null;
}

const FolderSelectModal = ({
  favoriteFolders,
  selectedProblemIds,
  setFavoriteFolders,
  setIsFavoriteModalOpen,
  reviewNoteList,
  setReviewNoteList,
  handleSelectUnit,
  setSelectedProblemIds,
  topFavoriteFolderId,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFavId, setSelectedFavId] = useState<number | undefined>(
    undefined
  );
  const [selectedFavName, setSelectedFavName] = useState<string>("");
  // console.log("favoriteFolders", favoriteFolders);

  // const handleModalOpen = () => setIsOpen(!isOpen);
  // const handleCreateFolder = async (folderName: string) => {
  //   const data = {
  //     name: folderName,
  //     type: 1,
  //     parent_id: 18,
  //   };

  //   const res = await createFolderApi(data);
  //   const newFolderId = res.id;

  //   const newFolder: Folder = {
  //     id: newFolderId,
  //     name: folderName,
  //     type: 1,
  //     parent_id: 18,
  //     children: [],
  //     problem_count: 0, // ✅ 이게 없으면 백엔드에서 undefined로 오류 날 수 있음
  //   };

  //   const updated = [...favoriteFolders];
  //   updated[0] = {
  //     ...updated[0],
  //     children: [...updated[0].children, newFolder],
  //   };

  //   setFavoriteFolders(updated);
  //   setSelectedFavId(newFolderId);
  //   setSelectedFavName(folderName);

  //   // ✅ 이 줄을 꼭 넣자: 클릭한 것처럼 처리
  //   setIsCreatingFolder(false);
  //   setIsOpen(false);
  // };

  const handleFolderSelect = (folder: Folder) => {
    setSelectedFavName(folder.name);
    setSelectedFavId(folder.id);
    setIsOpen(false);
    // console.log("여기", selectedFavId);
  };

  const handleMoveToFolder = async (folder: Folder) => {
    const movedProblems =
      reviewNoteList?.filter((item) =>
        selectedProblemIds.includes(item.problem_id)
      ) || [];

    const updatedFolder: Folder = {
      ...folder,
      problem_count: movedProblems.length,
      children: movedProblems,
    };

    const updatedFolders = [...favoriteFolders];
    updatedFolders[0] = {
      ...updatedFolders[0],
      children: [
        ...updatedFolders[0].children.filter((f) => f.id !== folder.id),
        updatedFolder,
      ],
    };

    setFavoriteFolders(updatedFolders);

    await Promise.all(
      selectedProblemIds.map((problemId) =>
        moveToFavFolderApi(problemId, folder.id, 1)
      )
    );
    // console.log("선택된문제ID", selectedProblemIds);

    setReviewNoteList(
      (prev: any[] | null) =>
        prev?.filter((item) => !selectedProblemIds.includes(item.problem_id)) ??
        null
    );
    setSelectedProblemIds([]);

    await handleSelectUnit({
      chapter: "즐겨찾기",
      section: folder.name,
      unit: null,
      type: 1,
      id: folder.id,
    });
  };

  const handleCreateAndMove = async (folderName: string) => {
    // 1. 폴더 생성
    const data = {
      name: folderName,
      type: 1,
      parent_id: topFavoriteFolderId,
    };

    const res = await createFolderApi(data);
    const newFolderId = res.id;

    const newFolder: Folder = {
      id: newFolderId,
      name: folderName,
      type: 1,
      parent_id: topFavoriteFolderId,
      children: [],
      problem_count: 0,
    };

    const updatedFolders = [...favoriteFolders];
    updatedFolders[0] = {
      ...updatedFolders[0],
      children: [...updatedFolders[0].children, newFolder],
    };

    setFavoriteFolders(updatedFolders);
    setSelectedFavId(newFolderId);
    setSelectedFavName(folderName);

    // 2. 문제 이동
    const movedProblems =
      reviewNoteList?.filter((item) =>
        selectedProblemIds.includes(item.problem_id)
      ) || [];

    const folderIndex = updatedFolders[0].children.findIndex(
      (folder) => folder.id === newFolderId
    );

    if (folderIndex !== -1) {
      updatedFolders[0].children[folderIndex] = {
        ...updatedFolders[0].children[folderIndex],
        problem_count: movedProblems.length,
        children: movedProblems,
      };

      setFavoriteFolders(updatedFolders);
    }

    if (!newFolderId || isNaN(newFolderId)) {
      alert("❗폴더 생성에 실패했거나 ID가 잘못되었습니다.");
      return;
    }

    // console.log("newFolderId", newFolderId);
    await Promise.all(
      selectedProblemIds.map((problemId) =>
        moveToFavFolderApi(problemId, newFolderId, 1)
      )
    );
    setSelectedProblemIds([]);

    // 3. 선택된 폴더로 이동
    await handleSelectUnit({
      chapter: "즐겨찾기",
      section: folderName,
      unit: null,
      type: 1,
      id: newFolderId,
    });

    // 4. 모달 닫기
    setIsCreatingFolder(false);
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
          {/* <button
            onClick={() => handleCreateFolder(newFolderName)}
            className="h-full px-4 bg-primary-500 text-white rounded-[4px] text-sm"
          >
            추가
          </button> */}
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
          onClick={() => {
            if (isCreatingFolder) {
              handleCreateAndMove(newFolderName);
            } else {
              if (!selectedFavId || isNaN(selectedFavId)) {
                alert("❗폴더가 선택되지 않았습니다.");
                return;
              }
              const folder = favoriteFolders[0].children.find(
                (f) => f.id === selectedFavId
              );
              if (folder) {
                handleMoveToFolder(folder);
                setIsOpen(false);
                setIsFavoriteModalOpen(false);
              }
            }
          }}
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default FolderSelectModal;
