import { useState } from "react";

const FolderSelectModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const handleModalOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleCreateFolder = (folderName: string) => {
    setNewFolderName(folderName);
  };
  return (
    <div>
      {isCreatingFolder ? (
        <div className="flex items-center gap-1 w-full">
          <div className="flex items-center gap-6 bg-gray-100 p-3 rounded-[4px]  min-w-72 min-h-12">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="새 폴더 이름"
              className="caption-medium text-gray-700 bg-transparent outline-none w-full"
            />
          </div>
          <button
            onClick={() => {
              if (newFolderName.trim() === "") return;
              handleCreateFolder(newFolderName);
              setNewFolderName("");
              setIsCreatingFolder(false);
            }}
            className="text-primary-500 caption-medium min-h-12 px-3 border border-primary-500 rounded-[4px]"
          >
            추가
          </button>
        </div>
      ) : (
        // ✅ 평소 상태
        <div className="flex items-center gap-5">
          <div
            className="flex items-center gap-6 bg-gray-100 p-3 rounded-[4px]  min-w-72 min-h-12"
            onClick={handleModalOpen}
          >
            <p className="text-gray-300 caption-medium">
              문제를 저장할 즐겨찾기 폴더를 선택해주세요
            </p>
            <img src="/icons/down.png" alt="아래 화살표" className="w-6 h-6" />
            {/* 폴더 추가 버튼 */}
          </div>
          <img
            src="/icons/add-square.png"
            alt="폴더 추가 버튼"
            className="w-9 h-9 cursor-pointer"
            onClick={() => setIsCreatingFolder(true)}
          />
        </div>
      )}

      {/* 드롭다운 영역 */}
      {isOpen && <div className="h-6 w-6 bg-red-400">열림</div>}
    </div>
  );
};

export default FolderSelectModal;
