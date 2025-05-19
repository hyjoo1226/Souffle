// 풀이 분석 페이지 상단 부분
import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { ReactComponent as Expand } from "@/assets/icons/Expand.svg";
import FolderSelectModal from "../reviewNoteList/FolderSelectModal";
import { useState, useEffect } from "react";
import {
  Folder,
  ReviewNoteList,
  //   UnitSelectPayload,
} from "@/services/api/ReviewNoteList";
import { getFavoriteFoldersApi } from "@/services/api/ReviewNoteList";
interface SolutionAnalysisHeaderProps {
  submissionId: number[];
}

const SolutionAnalysisHeader = ({
  submissionId,
}: SolutionAnalysisHeaderProps) => {
  //   const [isFolderSelectModalOpen, setIsFolderSelectModalOpen] = useState(false);
  const [favoriteFolders, setFavoriteFolders] = useState<Folder[] | null>(null);
  //   const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const [reviewNoteList, setReviewNoteList] = useState<ReviewNoteList | null>(
    null
  );

  const handleSelectUnit = () => {
    // console.log();
  };
  const [topFavoriteFolderId, setTopFavoriteFolderId] = useState<number | null>(
    null
  );

  const fetchFolderList = async () => {
    const folderList: Folder[] = await getFavoriteFoldersApi();

    const favoriteFolders = folderList.filter((f) => f.type === 1);
    setFavoriteFolders(favoriteFolders);

    const topFolderId = folderList.find(
      (f) => f.type === 1 && f.parent_id === null
    )?.id;
    setTopFavoriteFolderId(topFolderId || null);
  };

  useEffect(() => {
    fetchFolderList();
  }, []);

  return (
    <>
      {isFavoriteModalOpen && (
        <FolderSelectModal
          favoriteFolders={favoriteFolders || []}
          selectedProblemIds={submissionId}
          setFavoriteFolders={setFavoriteFolders}
          setIsFavoriteModalOpen={setIsFavoriteModalOpen}
          reviewNoteList={reviewNoteList}
          setReviewNoteList={setReviewNoteList}
          handleSelectUnit={handleSelectUnit}
          setSelectedProblemIds={() => {}}
          topFavoriteFolderId={topFavoriteFolderId}
        />
      )}
      <div className="flex items-start justify-between py-[21px]">
        <div className="">
          <p className="headline-large text-gray-700 mb-[8px]">
            문제 풀이 분석 결과
          </p>
          <p className="body-small text-gray-300">
            AI가 풀이 과정을 분석해 사고 흐름과 이해도를 평가하고, 잘한 점과
            보완할 부분을 구체적으로 안내해드립니다.
          </p>
        </div>
        <div className="flex space-x-6">
          <Link
            to="#"
            className="flex items-center justify-center text-gray-500"
          >
            <Expand className="text-gray-500" />
            <p className="headline-small">이전 문제</p>
          </Link>
          <Link
            to="#"
            className="flex items-center justify-center text-gray-500"
          >
            <p className="headline-small">다음 문제</p>
            <Expand className="text-gray-500 transform -scale-x-100" />
          </Link>

          <Link to="#" className="">
            <Button variant="solid">다시 풀어보기</Button>
          </Link>
          <Button
            variant="solid"
            onClick={() => {
              setIsFavoriteModalOpen(!isFavoriteModalOpen);
            }}
          >
            즐겨찾기 추가
          </Button>
        </div>
      </div>
    </>
  );
};

export default SolutionAnalysisHeader;
