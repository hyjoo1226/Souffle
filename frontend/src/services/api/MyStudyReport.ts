import { api } from "@/services/api/Api";

export const getSolvingActivityData = async (selectedYear: number) => {
  const response = await api.get("/users/statistic/heatmap", {
    params: {
      year: selectedYear,
    },
  });
  return response.data;
};
