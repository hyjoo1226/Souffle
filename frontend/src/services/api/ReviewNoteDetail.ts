import { api } from "@/services/api/Api";
import { Stroke } from "@/types/ReviewNoteDetail";
/**
 * 복습노트 문제 상세 조회 API
 * @param userProblemId - 복습노트 문제 고유 ID
 * @returns 문제 상세 데이터
 */
export const getReviewNoteDetailApi = async (userProblemId: number) => {
  const token = localStorage.getItem("accessToken")

  const response = await api.get(`/notes/content/${userProblemId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * 복습노트 필기 내용 저장 API
 * @param userProblemId - 복습노트 문제 고유 ID
 * @param solutionStrokes - 풀이 영역 스트로크
 * @param conceptStrokes - 개념 영역 스트로크
 */
export const patchReviewNoteStrokesApi = async (
  userProblemId: number,
  solutionStrokes: Stroke[][],
  conceptStrokes: Stroke[][]
) => {
  const response = await api.patch(
    `/notes/content/${userProblemId}/stroke`,
    {
      solution_strokes: solutionStrokes,
      concept_strokes: conceptStrokes,
    }
  );

  return response.data;
};