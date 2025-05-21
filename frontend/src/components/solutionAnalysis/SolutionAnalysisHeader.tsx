// 풀이 분석 페이지 상단 부분
import { Link, useNavigate } from "react-router-dom";
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
  problemId: number;
  selectedLessonName: string,
  selectedSubject: string,
  selectedUnit: string,
  problemNo: number,
  problemIndex: number,
  problemList: any,
  selectedUnitId: number,
}

const SolutionAnalysisHeader = ({
  submissionId,
  problemId,
  selectedLessonName,
  selectedSubject,
  selectedUnit,
  problemNo,
  problemIndex,
  problemList,
  selectedUnitId,
}: SolutionAnalysisHeaderProps) => {
  //   const [isFolderSelectModalOpen, setIsFolderSelectModalOpen] = useState(false);
  const [favoriteFolders, setFavoriteFolders] = useState<Folder[] | null>(null);
  //   const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const [reviewNoteList, setReviewNoteList] = useState<ReviewNoteList | null>(
    null
  );
  const navigate = useNavigate();

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

  const goToPrevious = () => {
    if (problemIndex > 0) {
      const prev = problemIndex - 1;
      const prevProblem = problemList[prev];

      navigate(`/solving/${prevProblem.problem_id}`, {
        state: {
          selectedLessonName,
          selectedSubject,
          selectedUnit,
          problemNo: prevProblem.inner_no, // 문제 번호 갱신
          problemIndex: prev,
          problemList,
        },
      });
    }
  };

  const goToNext = () => {
    if (problemIndex < problemList.length - 1) {
      const next = problemIndex + 1;
      const nextProblem = problemList[next];

      navigate(`/solving/${nextProblem.problem_id}`, {
        state: {
          selectedLessonName,
          selectedSubject,
          selectedUnit,
          problemNo: nextProblem.inner_no, // 문제 번호 갱신
          problemIndex: next,
          problemList,
        },
      });
    }
  };

  return (
    <>
      {
        isFavoriteModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/40"
            onClick={() => setIsFavoriteModalOpen(false)}
          >
            <div
              className="min-w-[320px] max-w-lg w-full flex justify-center items-center"
              onClick={(e) => e.stopPropagation()}
            >
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
            </div>
          </div>
        )
      }
      <div className="flex items-start justify-between py-[21px]">
        <div className="">
          <p className="headline-large text-gray-700 mb-[8px]">
            문제 풀이 분석 결과
          </p>
          <p className="body-small text-gray-300 hidden md:block">
            AI가 풀이 과정을 분석해 사고 흐름과 이해도를 평가하고, 잘한 점과
            보완할 부분을 구체적으로 안내해드립니다.
          </p>
        </div>
        <div className="flex space-x-6">
          <div
            className="flex items-center justify-center text-gray-500 min-w-25"
            onClick={goToPrevious}
          >
            <Expand className="text-gray-500" />
            <p className="headline-small">이전 문제</p>
          </div>
          <div
            className="flex items-center justify-center text-gray-500 min-w-25"
            onClick={goToNext}
          >
            <p className="headline-small">다음 문제</p>
            <Expand className="text-gray-500 transform -scale-x-100" />
          </div>

          <Link 
            to={`/solving/${problemId}`} 
            state={{
              selectedLessonName,
              selectedSubject,
              selectedUnit,
              problemNo,
              problemIndex,
              problemList,
              selectedUnitId,
            }}
            className="min-w-33.75"
          >
            <Button variant="solid">다시 풀어보기</Button>
          </Link>
          <Button
            variant="solid"
            onClick={() => {
              setIsFavoriteModalOpen(!isFavoriteModalOpen);
            }}
            className="min-w-33.75"
          >
            즐겨찾기 추가
          </Button>
        </div>
      </div>
    </>
  );
};

export default SolutionAnalysisHeader;
