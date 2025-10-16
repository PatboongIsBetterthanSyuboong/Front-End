import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { attachInterceptors } from "./interceptors";
import type { HttpClientOptions, TokenGetter } from "./types";

let sharedInstance: AxiosInstance | null = null;
let sharedTokenGetter: TokenGetter | undefined;

function createInstance(options?: HttpClientOptions): AxiosInstance {
  const baseURL = options?.baseURL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "/";
  const timeout = options?.timeoutMs ?? 15000;

  const instance = axios.create({
    baseURL,
    timeout,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  attachInterceptors(instance, options?.getAuthToken ?? sharedTokenGetter);
  return instance;
}

export function setAuthTokenGetter(getter: TokenGetter): void {
  sharedTokenGetter = getter;
  if (sharedInstance) {
    attachInterceptors(sharedInstance, sharedTokenGetter);
  }
}

export function http(options?: HttpClientOptions): AxiosInstance {
  if (!sharedInstance) {
    sharedInstance = createInstance(options);
  }
  return sharedInstance;
}

// Convenience helpers with typed responses
export async function get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await http().get<T>(url, config);
  return res.data;
}

export async function post<T = unknown, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await http().post<T>(url, body, config);
  return res.data;
}

export async function put<T = unknown, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await http().put<T>(url, body, config);
  return res.data;
}

export async function del<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await http().delete<T>(url, config);
  return res.data;
}


