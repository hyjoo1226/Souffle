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
  switchOrderFolderAPi,
} from "@/services/api/ReviewNoteList";

interface Props {
  chapter: string;
  sections: Folder[];
  type: number;
  folders: Folder[] | null;
  favoriteFolders: Folder[] | null;
  setFavoriteFolders: (folders: Folder[]) => void;
  onSelectUnit: ({ section, type, unit, id }: UnitSelectPayload) => void;
  onDropProblem?: (targetSection: string, problemIds: number[]) => void;
}

const NoteFolder = ({
  chapter,
  sections,
  type,
  folders,
  favoriteFolders,
  setFavoriteFolders,
  onSelectUnit,
  onDropProblem,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };
  // console.log(
  //   "favoriteFolders.children",
  //   favoriteFolders?.[0]?.children ?? "No children available"
  // );
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [_isUpdateFolder, setIsUpdateFolder] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleCreateFolder = async () => {
    if (!folders) return;
    const data = { name: newFolderName, type: 1, parent_id: folders[0]?.id };

    const res = await createFolderApi(data);
    // console.log("res", res);

    // console.log("newFolderName", newFolderName);
    // console.log("selectedFolderId", folders[0]?.id);
    // console.log("type", 1);

    const newFolder: Folder = {
      id: res.folder_id, // or 서버 응답으로 받은 ID
      name: newFolderName,
      type,
      parent_id: type,
      problem_count: 0,
      children: [],
    };

    const updated = folders.map((folder) => {
      if (folder.name === chapter) {
        return {
          ...folder,
          children: [...folder.children, newFolder],
        };
      }
      return folder;
    });

    setFavoriteFolders(updated); // 또는 setFolders(updated);
    setNewFolderName("");
    setIsCreatingFolder(false);
  };

  const handleUpdateFolder = (sectionId: number, newFolderName: string) => {
    const data = {
      name: newFolderName,
    };
    updateFolderApi(sectionId, data);

    const updated = folders?.map((folder) => {
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
    deleteFolderApi(folderId);
    const updated =
      folders?.map((folder) => ({
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
          {sections.map((section, index) => (
            <div
              key={section.id}
              draggable={selectedFolderId !== section.id}
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async () => {
                if (draggedIndex === null || draggedIndex === index) return;

                const newSections = [...sections];
                const [moved] = newSections.splice(draggedIndex, 1);
                newSections.splice(index, 0, moved);

                const updatedFolders =
                  favoriteFolders?.map((folder) =>
                    folder.name === chapter
                      ? { ...folder, children: newSections }
                      : folder
                  ) ?? [];

                setFavoriteFolders(updatedFolders);

                await switchOrderFolderAPi(moved.id, index);

                setDraggedIndex(null);
              }}
              className="pl-8"
              style={{
                opacity: draggedIndex === index ? 0.5 : 1,
                cursor: selectedFolderId === section.id ? "default" : "move",
              }}
            >
              {selectedFolderId === section.id ? (
                <div className="flex gap-x-2 items-center">
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
                  chapter={chapter}
                  sectionTitle={section.name}
                  count={section.problem_count ?? 0}
                  id={section.id}
                  type={section.type}
                  subUnit={section.children}
                  setIsUpdateFolder={setIsUpdateFolder}
                  setSelectedFolderId={setSelectedFolderId}
                  setNewFolderName={setNewFolderName}
                  onSelectUnit={(child?: UnitSelectPayload) => {
                    if (!child) return;
                    onSelectUnit(child);
                  }}
                  onDropProblem={(targetSection, problemIds) =>
                    onDropProblem?.(targetSection, problemIds)
                  }
                  onDeleteFolder={handleDeleteFolder}
                />
              )}
            </div>
          ))}

          {/* 폴더 생성 input */}
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
