export interface CategoryProps {
  categoryData: CategoryData[];
  selectedLessonId: number | null; // 선택된 소단원 ID
  setSelectedLessonId: (lessonId: number) => void; // 선택된 소단원 ID를 설정하는 함수
  setSelectedLessonName: (lessonName: string) => void; // 선택된 소단원 이름을 설정하는 함수
}

interface CategoryData {
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
