export interface Category {
  id: number;
  name: string;
  type: number;
  children?: Category[]; // 자식 노드는 선택적으로 존재
}

export interface ConceptImage {
  id: number;
  url: string;
  order: number;
}

export interface Concept {
  id: number;
  title: string;
  description: string;
  order: number;
  images: ConceptImage[];
}

export interface ProblemSummary {
  problem_id: number;
  inner_no: number;
  type: number;
  problem_avg_accuracy: number;
  try_count: number;
  correct_count: number;
}

export interface UserStats {
  accuracy: number;
  progress_rate: number;
  solve_time: number;
}

export interface UnitDetail {
  category_id: number;
  avg_accuracy: number;
  user: UserStats;
  concepts: Concept[];
  problem: ProblemSummary[];
}


export interface CategoryInfo {
  id: number;
  name: string;
  type: number;
}

export interface AncestorResponse {
  current: CategoryInfo;
  ancestors: CategoryInfo[];
}

export interface Blank {
  blank_id: number;
  blank_index: number;
  answer_index: number;
  choice: string[];
}

export interface Quiz {
  quiz_id: number;
  content: string;
  order: number;
  blanks: Blank[];
}

export interface ConceptQuiz {
  concept_id: number;
  title: string;
  quizzes: Quiz[];
}

export interface TotalQuiz {
  category_id: number;
  concepts: ConceptQuiz[];
}

export interface Problem {
  id: number;
  title: string;
  sentence: string[];
  blanks: string[]; // 사용자가 입력한 답
  choices: string[][]; // 각 blank에 대한 선택지 배열
  correctAnswers: string[];
}
