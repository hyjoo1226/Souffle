import { multipartApi } from "@/services/api/Api";

// 풀이 데이터 전송
export const sendProblemSolvingDataApi = async (formData: FormData) => {
  const response = await multipartApi.post("/submission", formData);
  return response.data;
};
