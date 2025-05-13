import { useState, useRef, useEffect } from "react";
import { ReactComponent as Folder } from "@/assets/icons/Folder.svg";
import { ReactComponent as MenuButton } from "@/assets/icons/MenuButton.svg";
import { ReactComponent as Edit } from "@/assets/icons/Edit.svg";
import { ReactComponent as Trash } from "@/assets/icons/Trash.svg";

interface Props {
  id: number;
  title: string;
  count: number;
  setIsUpdateFolder: (value: boolean) => void;
  setSelectedFolderId: (value: number) => void;
  setNewFolderName: (value: string) => void;
  onClick: () => void;
  onDropProblem?: (targetSection: string, problemIds: number[]) => void;
}

const NoteSectionItem = ({
  title,
  count,
  id,
  setIsUpdateFolder,
  setSelectedFolderId,
  setNewFolderName,
  onClick,
  onDropProblem,
}: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      className="relative flex w-full items-center justify-between pl-8 cursor-pointer"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("application/json");
        try {
          const problemIds: number[] = JSON.parse(data);
          onDropProblem?.(title, problemIds); // title은 소단원명
        } catch (err) {
          console.error("문제 ID 파싱 오류:", err);
        }
      }}
    >
      <div className="flex gap-x-2 items-center" onClick={onClick}>
        <Folder className="text-gray-700" />
        <p className="body-medium text-gray-700">{title}</p>
        <p className="caption-medium text-primary-700">{count}</p>
      </div>

      <div onClick={toggleMenu}>
        <MenuButton className="text-gray-400" />
      </div>

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
            }}
          >
            <Edit className="w-4 h-4" />
            폴더명 변경
          </button>
          <button className="w-full flex items-center gap-x-3 text-left caption-medium text-gray-700">
            <Trash className="w-4 h-4" />
            폴더 삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteSectionItem;
