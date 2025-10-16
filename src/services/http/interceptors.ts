import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";
import type { TokenGetter } from "./types";
import { HttpError } from "./types";

export function attachInterceptors(instance: AxiosInstance, getToken?: TokenGetter): void {
  instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (getToken) {
      const token = await getToken();
      if (token) {
        config.headers = {
          ...(config.headers ?? {}),
          Authorization: `Bearer ${token}`,
        } as typeof config.headers;
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status ?? 0;
      const data = error.response?.data as unknown;
      const message =
        (typeof data === "object" && data && (data as any).message) || error.message || "HTTP Error";
      throw new HttpError(message, status, data);
    }
  );
}


