import { api } from "@/services/api/Api";
// const token = localStorage.getItem("accessToken");
export const getSolvingActivityData = async (selectedYear: number) => {
  const response = await api.get("/users/statistic/heatmap", {
    params: {
      year: selectedYear,
    },
  });
  return response.data;
};

export const getStudyTimeData = async (selectedDate: string) => {
  const response = await api.get("/users/statistic/weekly-study", {
    params: {
      date: selectedDate,
    },
  });
  return response.data;
};

export const getUnitData = async () => {
  const response = await api.get("/users/statistic/category-analysis");
  return response.data;
};

export const getUserScoreStats = async () => {
  const response = await api.get("/users/statistic/score-stats");
  return response.data;
};

export const getUserReport = async () => {
  const response = await api.get("/users/report/latest");
  return response.data;
};
