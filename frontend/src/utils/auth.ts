// 로그인 여부 판단 로직
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem("accessToken");
};
