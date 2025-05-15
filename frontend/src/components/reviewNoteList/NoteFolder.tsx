// 중단원 하나 + 그 안의 소단원들
import { useState } from "react";
import { ReactComponent as ExpandSlim } from "@/assets/icons/ExpandSlim.svg";
import { ReactComponent as FolderAdd } from "@/assets/icons/FolderAdd.svg";
import NoteSectionItem from "./NoteSectionItem";
import {
  Folder,
  createFolderApi,
  updateFolderApi,
  deleteFolderApi,
  UnitSelectPayload,
} from "@/services/api/ReviewNoteList";

interface Props {
  chapter: string;
  sections: Folder[];
  type: number;
  favoriteFolders: Folder[] | null;
  setFavoriteFolders: (folders: Folder[]) => void;
  onSelectUnit: ({ section, type, unit, id }: UnitSelectPayload) => void;
  onDropProblem?: (targetSection: string, problemIds: number[]) => void;
}

const NoteFolder = ({
  chapter,
  sections,
  type,
  favoriteFolders,
  setFavoriteFolders,
  onSelectUnit,
  onDropProblem,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isUpdateFolder, setIsUpdateFolder] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreateFolder = () => {
    const data = {
      name: newFolderName,
      type: type,
      parent_id: type,
    };
    console.log(data);
    // createFolderApi(data);
  };

  const handleUpdateFolder = (sectionId: number, newFolderName: string) => {
    const data = {
      name: newFolderName,
    };
    // updateFolderApi(sectionId, data);

    const updated = favoriteFolders?.map((folder) => {
      const updatedChildren = folder.children.map((child) =>
        child.id === sectionId ? { ...child, name: newFolderName } : child
      );
      return { ...folder, children: updatedChildren };
    });
    setFavoriteFolders(updated ?? []);
    // console.log("sectionId", sectionId);
    // console.log("data", data);
    setSelectedFolderId(null);
    setNewFolderName("");
    setIsUpdateFolder(false);
  };

  const handleDeleteFolder = (folderId: number) => {
    // deleteFolderApi(folderId);
    const updated =
      favoriteFolders?.map((folder) => ({
        ...folder,
        children: folder.children.filter((child) => child.id !== folderId),
      })) ?? [];
    setFavoriteFolders(updated);
  };
  return (
    <div className="w-full flex flex-col gap-y-2.5">
      {/* 중단원 상단 */}
      <div className="flex contents-center justify-between w-full cursor-pointer">
        <div
          className="flex gap-x-2.5 items-center w-full"
          onClick={handleToggle}
        >
          <ExpandSlim
            className={`text-gray-700 transform transition-transform duration-200 ${
              isOpen ? "rotate-270" : "rotate-180"
            }`}
          />
          <p className="headline-small text-gray-700">{chapter}</p>
        </div>
        {type === 1 ? (
          <FolderAdd
            className="text-gray-700"
            onClick={() => setIsCreatingFolder(!isCreatingFolder)}
          />
        ) : null}
      </div>

      {/* 소단원 리스트 */}
      {isOpen && (
        <div className="flex flex-col gap-y-2">
          {sections.map((section) =>
            selectedFolderId === section.id ? (
              // 수정 중인 폴더 자리에 input 표시
              <div key={section.id} className="flex gap-x-2 items-center pl-8">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="border border-gray-200 px-2 py-1 rounded w-full text-gray-700"
                />
                <button
                  onClick={() => {
                    if (newFolderName.trim() === "") return;
                    handleUpdateFolder(section.id, newFolderName);
                  }}
                  className="text-body-small bg-primary-500 text-white px-2 py-1 rounded min-w-[70px]"
                >
                  수정
                </button>
              </div>
            ) : (
              <NoteSectionItem
                key={section.id}
                title={section.name}
                count={section.problem_count ?? 0}
                id={section.id}
                type={section.type}
                subUnit={section.children}
                setIsUpdateFolder={setIsUpdateFolder}
                setSelectedFolderId={setSelectedFolderId}
                setNewFolderName={setNewFolderName}
                onSelectUnit={(child) => {
                  if (!child) return;
                  onSelectUnit({
                    chapter: chapter,
                    section: section.name,
                    type: section.type,
                    unit: child.name,
                    id: child.id,
                    name: child.name, // Ensure 'name' is included as required by UnitSelectPayload
                  });
                }}
                onDropProblem={(targetSection, problemIds) =>
                  onDropProblem?.(targetSection, problemIds)
                }
                onDeleteFolder={handleDeleteFolder}
              />
            )
          )}

          {isCreatingFolder && (
            <div className="flex gap-x-2 items-center pl-8">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="border border-gray-200 px-2 py-1 rounded w-full text-gray-700"
                placeholder="새 폴더 이름을 입력해주세요"
              />
              <button
                onClick={() => {
                  if (newFolderName.trim() === "") return;

                  handleCreateFolder();
                  setNewFolderName("");
                  setIsCreatingFolder(false);
                }}
                className="text-body-small bg-primary-500 text-white px-2 py-1 rounded min-w-[70px]"
              >
                추가
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteFolder;
