export interface CategoryProps {
  categoryData: CategoryData[];
  selectedLessonId: number | null; // 선택된 소단원 ID
  setSelectedLessonId: (lessonId: number | null) => void; // 선택된 소단원 ID를 설정하는 함수
  selectedLessonName: string | null;
  setSelectedLessonName: (lessonName: string | null) => void; // 선택된 소단원 이름을 설정하는 함수
  selectedSubject: string | null;
  setSelectedSubject: (selectedSubject: string | null) => void;
  selectedUnit: string | null;
  setSelectedUnit: (selectedUnit: string | null) => void;
  setSelectedUnitId: (selectedUnitId: number) => void;
}

export interface CategoryData {
  id: number;
  name: string;
  type: 1; // 대단원
  children: UnitData[];
}

interface UnitData {
  id: number;
  name: string;
  type: 2; // 중단원
  children: LessonData[];
}

interface LessonData {
  id: number;
  name: string;
  type: 3; // 소단원
}
