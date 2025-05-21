// src/types/ReviewNoteDetail.ts

export interface Stroke {
  x: number;
  y: number;
}

export interface Category {
  id: number;
  name: string;
  parent: Category | null;
}

export interface SubmissionStep {
  step_number: number;
  step_image_url: string | null;
  step_time: number;
  step_valid: boolean;
  step_feedback: string | null;
  step_latex: string | null;
}

export interface ProblemData {
  problem_id: number;
  content: string;
  choice: string | null;
  problem_image_url: string | null;
  answer: string;
  explanation: string;
  explanation_image_url: string | null;
  inner_no: number;
  solution_strokes: Stroke[][];
  concept_strokes: Stroke[][];
  book_name: string;
  publisher: string;
  year: number;
  category: Category;
  total_solve_time: number;
  understand_time: number;
  solve_time: number;
  review_time: number;
  answer_convert: string | null;
  full_step_image_url: string | null;
  is_correct: boolean | null;
  ai_analysis: string | null;
  weekness: string | null;
  submission_steps: SubmissionStep[];
}
