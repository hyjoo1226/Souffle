import { api } from "@/services/api/Api";
import { User } from "@/types/User";

export const getUserInfoApi = async (): Promise<User> => {
  const response = await api.get<User>("/users/my-profile");
  return response.data;
};

export const patchRemakeNicknameApi = async (
  nickname: string,
) => {
  const response = await api.patch(
    `/users/my-profile`,
    {
      nickname: nickname,
    }
  );

  return response.data;
};