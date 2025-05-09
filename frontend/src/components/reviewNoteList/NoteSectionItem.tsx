// 소단원 하나를 담당
import { ReactComponent as Folder } from "@/assets/icons/Folder.svg";
import { ReactComponent as MenuButton } from "@/assets/icons/MenuButton.svg";

interface Props {
  title: string;
  count: number;
  onClick: () => void;
}

const NoteSectionItem = ({ title, count, onClick }: Props) => {
  return (
    <div className="flex w-full items-center justify-between pl-8 cursor-pointer">
      <div className="flex gap-x-2 items-center" onClick={onClick}>
        <Folder className="text-gray-700" />
        <p className="body-medium text-gray-700">{title}</p>
        <p className="caption-medium text-primary-700">{count}</p>
      </div>
      <MenuButton className="text-gray-400" />
    </div>
  );
};

export default NoteSectionItem;
