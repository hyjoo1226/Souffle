import { api } from "@/services/api/Api";

// accessToken 재발급
export const refreshAccessTokenApi = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) return null;

  try {
    const response = await api.post("/auth/refresh", {
      refresh_token: refreshToken,
    });

    const { access_token } = response.data;

    if (access_token) {
      localStorage.setItem("accessToken", access_token);
      return access_token;
    }

    return null;
  } catch (error) {
    console.error("accessToken 재발급 실패:", error);
    return null;
  }
};