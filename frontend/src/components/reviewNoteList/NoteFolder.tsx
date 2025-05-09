// 중단원 하나 + 그 안의 소단원들
import { useState } from "react";
import { ReactComponent as ExpandSlim } from "@/assets/icons/ExpandSlim.svg";
import { ReactComponent as FolderAdd } from "@/assets/icons/FolderAdd.svg";
import NoteSectionItem from "./NoteSectionItem";

interface Props {
  chapter: string;
  sections: { title: string; count: number }[];
  onSelectSection: (chapter: string, section: string) => void;
}

const NoteFolder = ({ chapter, sections, onSelectSection }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  }

  return (
    <div className="w-full flex flex-col gap-y-2.5">
      {/* 중단원 상단 */}
      <div className="flex contents-center justify-between w-full cursor-pointer" onClick={handleToggle}>
        <div className="flex gap-x-2.5 items-center">
          <ExpandSlim 
            className={`text-gray-700 transform transition-transform duration-200 ${
                isOpen ? "rotate-270" : "rotate-180"
            }`} 
          />
          <p className="headline-small text-gray-700">{chapter}</p>
        </div>
        <FolderAdd className="text-gray-700" />
      </div>

      {/* 소단원 리스트 */}
      {isOpen && (
        <div className="flex flex-col gap-y-2">
          {sections.map((section) => (
            <NoteSectionItem 
                key={section.title} 
                title={section.title} 
                count={section.count}
                onClick={() => onSelectSection(chapter, section.title)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteFolder;
