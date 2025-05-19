import { api } from "@/services/api/Api";
import { Category } from "@/types/SelectUnit";
import { AncestorResponse } from "@/types/SelectUnit";
import { TotalQuiz } from "@/types/SelectUnit";

export const getTotalUnitApi = async (): Promise<Category[]> => {
  const response = await api.get(`/categories/tree/`);
  return response.data;
};

export const getUnitDetailApi = async (categoryId: number) => {
  const response = await api.get(`/categories/${categoryId}`);
  return response.data;
};

export const getCategoryAncestorsApi = async (categoryId: number) => {
  const response = await api.get<AncestorResponse>(`/categories/${categoryId}/ancestors`);
  return response.data;
};

export const getProblemStudyApi = async (categoryId: number) => {
  const response = await api.get<TotalQuiz>(`/concepts/${categoryId}/quiz`);
  return response.data;
};