import { useState, useRef, useEffect } from "react";
import { ReactComponent as Folder } from "@/assets/icons/Folder.svg";
import { ReactComponent as MenuButton } from "@/assets/icons/MenuButton.svg";
import { ReactComponent as Edit } from "@/assets/icons/Edit.svg";
import { ReactComponent as Trash } from "@/assets/icons/Trash.svg";
import {
  Folder as FolderType,
  UnitSelectPayload,
} from "@/services/api/ReviewNoteList";
import { ReactComponent as ExpandSlim } from "@/assets/icons/ExpandSlim.svg";

interface Props {
  id: number;
  sectionTitle: string;
  title: string;
  count: number;
  type: number;
  subUnit: FolderType[];
  setIsUpdateFolder: (value: boolean) => void;
  setSelectedFolderId: (value: number) => void;
  setNewFolderName: (value: string) => void;
  onSelectUnit: (child?: UnitSelectPayload) => void;
  onDropProblem?: (targetSection: string, problemIds: number[]) => void;
  onDeleteFolder: (folderId: number) => void;
}

const NoteSectionItem = ({
  id,
  title,
  count,
  type,
  subUnit,
  setIsUpdateFolder,
  setSelectedFolderId,
  setNewFolderName,
  onSelectUnit,
  onDropProblem,
  onDeleteFolder,
}: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="relative w-full"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("application/json");
        try {
          const problemIds: number[] = JSON.parse(data);
          onDropProblem?.(title, problemIds); // title은 중단원명
        } catch (err) {
          console.error("문제 ID 파싱 오류:", err);
        }
      }}
    >
      {/* 중단원 상단 */}
      <div className="flex items-center justify-between w-full pl-8 pr-4 cursor-pointer">
        <div
          className="flex items-center gap-x-2"
          onClick={() => {
            if (type === 1 && onSelectUnit) {
              onSelectUnit({
                chapter: title,
                section: sectionTitle,
                unit: null,
                type, // ✅ 올바른 type
                id,
                name: title,
              });
            } else {
              setIsOpen((prev) => !prev);
            }
          }}
        >
          {type !== 1 && (
            <ExpandSlim
              className={`text-gray-700 w-4 h-4 transform transition-transform duration-200 ${
                isOpen ? "rotate-270" : "rotate-180"
              }`}
            />
          )}
          <Folder className="text-gray-700" />
          <p className="body-medium text-gray-700">{title}</p>
          <p className="caption-medium text-primary-700">{count}</p>
        </div>

        {type === 1 && (
          <div onClick={toggleMenu}>
            <MenuButton className="text-gray-400" />
          </div>
        )}
      </div>

      {/* 메뉴 드롭다운 */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute p-3 top-full right-0 mt-2 w-32 bg-white border border-gray-100 figma-shadow rounded-[10px] z-50"
        >
          <button
            className="w-full mb-2 flex items-center gap-x-3 text-left caption-medium text-gray-700"
            onClick={() => {
              setIsUpdateFolder(true);
              setSelectedFolderId(id);
              setNewFolderName(title);
              setIsMenuOpen(false);
            }}
          >
            <Edit className="w-4 h-4" />
            폴더명 변경
          </button>
          <button
            className="w-full flex items-center gap-x-3 text-left caption-medium text-gray-700"
            onClick={() => {
              const confirmDelete = window.confirm("폴더를 삭제하시겠습니까?");
              setSelectedFolderId(id);
              setIsMenuOpen(false);
              if (confirmDelete) {
                onDeleteFolder(id);
              }
            }}
          >
            <Trash className="w-4 h-4" />
            폴더 삭제
          </button>
        </div>
      )}

      {/* 소단원 리스트 */}
      {isOpen && subUnit && subUnit.length > 0 && (
        <div className="ml-19 mt-2 flex flex-col gap-y-1">
          {subUnit.map((child) => (
            <div
              key={child.id}
              className="flex items-center gap-x-2 pl-4 py-1 cursor-pointer hover:bg-gray-50 rounded"
              onClick={() =>
                onSelectUnit({
                  chapter: title,
                  section: title,
                  unit: title,
                  type,
                  id,
                  name: title,
                })
              }
            >
              <p className="body-medium text-gray-600">{child.name}</p>
              <p className="body-medium text-primary-700">
                {child.problem_count ?? 0}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteSectionItem;
