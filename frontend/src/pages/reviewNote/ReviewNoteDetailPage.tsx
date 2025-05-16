// 오답노트 상세 페이지
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getReviewNoteDetailApi, patchReviewNoteStrokesApi } from "@/services/api/ReviewNoteDetail";
import { Stroke } from "@/types/ReviewNoteDetail";

import ReviewNoteDeatilHeader from '@/components/reviewNoteDetail/ReviewNoteDetailHeader';
import Problem from '@/components/reviewNoteDetail/Problem';
import SolutionNote from '@/components/reviewNoteDetail/SolutionNote';
import ExplanationModal from '@/components/reviewNoteDetail/ExplanationModal';
import MathExplanation from '@/components/reviewNoteDetail/MathExplanation';
import SaveSuccessModal from '@/components/reviewNoteDetail/SaveSuccessModal';
import { Button } from '@/components/common/Button';
import { ProblemData } from '@/types/ReviewNoteDetail';

const ReviewNoteDetailPage = () => {
  const { user_problem_id } = useParams<{ user_problem_id: string }>();
  const [problemData, setProblemData] = useState<ProblemData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaveSuccessModalOpen, setIsSaveSuccessModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const [solutionStrokesState, setSolutionStrokesState] = useState<Stroke[][]>([]);
  const [conceptStrokesState, setConceptStrokesState] = useState<Stroke[][]>([]);

  useEffect(() => {
    if (!user_problem_id) return;

    const fetchData = async () => {
      try {
        const data = await getReviewNoteDetailApi(Number(user_problem_id));
        setProblemData(data);
        console.log(data.content)
      } catch (error) {
        console.error("문제 상세 조회 실패:", error);
        // 에러 처리는 여기서
      }
    };

    fetchData();
  }, [user_problem_id]);

  useEffect(() => {
    if (problemData) {
      console.log("업데이트된 문제 데이터:", problemData);
    }
  }, [problemData]);

  return (
    <div className="">
        <ReviewNoteDeatilHeader totalSoloveTime={problemData?.total_solve_time} />
        <Problem 
          content={problemData?.content} 
          innerNo={problemData?.inner_no}
          bookName={problemData?.book_name}
          categoryName={problemData?.category.name}
          publisher={problemData?.publisher}
          problemImageUrl={problemData?.problem_image_url ?? undefined}
        />
        <SolutionNote 
          aiAnalysis={problemData?.ai_analysis ?? undefined} 
          weekness={problemData?.weekness ?? undefined} 
          submissionSteps={problemData?.submission_steps ?? []}
          conceptStrokes={problemData?.concept_strokes}
          solutionStrokes={problemData?.solution_strokes}
          onStrokeUpdate={(solution, concept) => {
            setSolutionStrokesState(solution);
            setConceptStrokesState(concept);
          }}
        />
        <div className='my-8 flex justify-center gap-x-3.5'>
          <Button onClick={openModal} >해설 보기</Button>
          <Button
            variant="solid"
            onClick={async () => {
              if (!user_problem_id) return;
              try {
                await patchReviewNoteStrokesApi(
                  Number(user_problem_id),
                  solutionStrokesState,
                  conceptStrokesState
                );
                setIsSaveSuccessModalOpen(true);
              } catch (e) {
                alert("저장 중 오류가 발생했습니다.");
                console.error("저장 실패:", e);
              }
            }}
          >
            노트 저장
          </Button>
        </div>

        {/* 해설 모달 */}
        <ExplanationModal isOpen={isModalOpen} onClose={closeModal}>
          <p className="headline-small text-gray-800 mb-4">🧠 해설</p>
          <MathExplanation text={problemData?.explanation || '해설 정보가 없습니다.'} />
        </ExplanationModal>

        {/* 저장 완료 모달 */}
        <SaveSuccessModal
          isOpen={isSaveSuccessModalOpen}
          onClose={() => setIsSaveSuccessModalOpen(false)}
        />
    </div>
  );
};

export default ReviewNoteDetailPage;
