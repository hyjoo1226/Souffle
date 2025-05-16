import { useNavigate } from "react-router-dom";
import axios, { AxiosInstance } from "axios";
import { refreshAccessTokenApi } from "./GoogleAuth";

export const BASE_URL = import.meta.env.VITE_APP_API_URL;

// axios.defaults.withCredentials = true;
// axios.defaults.headers.common["Content-Type"] = "application/json";

const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (request) => {
      console.log("api: ", request.url, "호출됨.");
      // const accessToken = getAccessToken();
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        request.headers.Authorization = `Bearer ${accessToken}`;
      }

      if (!(request.data instanceof FormData)) {
        request.headers["Content-Type"] = "application/json";
      }
      return request;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // const errorState = error.status;

      // switch (errorState) {

      // }
      const originalRequest = error.config;

      // accessToken 만료로 401에러가 발생 and 재시도 한 적 없는 요청
      if (
        error.response?.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        const newAccessToken = await refreshAccessTokenApi();

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest); // 요청 재시도
        }

        // 재발급 실패 -> 로그아웃 처리 후 이동
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        const navigate = useNavigate();
        navigate("/", { replace: true })
      }

      return Promise.reject(error);
    }
  );
};

const createInstance = (headers = {}): AxiosInstance => {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers,
    // withCredentials: true,
  });

  setupInterceptors(instance);

  return instance;
};

export const createAxiosInstance = (): AxiosInstance => createInstance();

export const createMultipartAxiosInstance = (): AxiosInstance =>
  createInstance();

export const api = createAxiosInstance();
export const multipartApi = createMultipartAxiosInstance();
// export const multipartApi = axios.create({
//   baseURL: import.meta.env.VITE_APP_API_URL,
//   withCredentials: true, // 쿠키 필요 시
// });
