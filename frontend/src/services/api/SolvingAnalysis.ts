import { api } from "@/services/api/Api";

/** 제출 단계별 정보 */
export interface SubmissionStep {
  step_number: number;
  step_image_url: string;
  step_time: number;
  step_valid: boolean;
}

/** 풀이 시간 정보 */
export interface SubmissionTime {
  total_solve_time: number;
  understand_time: number;
  solve_time: number;
  review_time: number;
}

/** 풀이 해설 정보 */
export interface SubmissionExplanation {
  explanation_answer: string;
  explanation_description: string;
  explanation_image_url: string;
}

/** 제출 상태 */
export type SubmissionStatus = "processing" | "completed" | "failed";

/** 백엔드 응답 타입 */
export interface SubmissionResponse {
  submissionId: number;
  answer_image_url: string;
  full_step_image_url: string;
  steps: SubmissionStep[];
  time: SubmissionTime;
  explanation: SubmissionExplanation;
  ai_analysis: string;
  weakness: string;
  status: SubmissionStatus;
}

/**
 * 특정 submissionId에 대한 풀이 분석 정보 조회
 */
export const getSolutionAnalysis = async (
  submissionId: number
): Promise<SubmissionResponse> => {
  const { data } = await api.get<SubmissionResponse>(
    `/submissions/${submissionId}`
  );
  return data;
};
