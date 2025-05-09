import axios, { AxiosInstance } from "axios";

export const BASE_URL = import.meta.env.VITE_APP_API_URL;

// axios.defaults.withCredentials = true;
// axios.defaults.headers.common["Content-Type"] = "application/json";

const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (request) => {
      console.log("api: ", request.url, "호출됨.");

      // const accessToken = getAccessToken();
      const accessToken = "1";

      if (accessToken) {
        request.headers.Authorization = accessToken;
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
