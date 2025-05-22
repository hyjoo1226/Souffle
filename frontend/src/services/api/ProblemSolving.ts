import { api, multipartApi } from "@/services/api/Api";

// 전체 단원 조회
export const getAllCategoriesApi = async () => {
  const response = await api.get("/categories/tree");
  return response.data;
};

// 풀이 데이터 전송
export const sendProblemSolvingDataApi = async (formData: FormData) => {
  const response = await multipartApi.post("/submissions", formData);
  return response.data;
};

// 개별 문제 조회
export const getProblemDataApi = async (problemId: number) => {
  const response = await api.get(`/problems/${problemId}`);
  return response.data;
};

// 문제 리스트 조회
export const getProblemListApi = async (categoryId: number) => {
  const response = await api.get(`/categories/${categoryId}`);
  return response.data;
};
