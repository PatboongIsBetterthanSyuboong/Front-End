import { post } from "./http/client";
import { setAccessToken } from "@/lib/auth/token";

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface SignupRequestBody {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponseBody {
  accessToken: string;
  user?: {
    id: string | number;
    email: string;
    name?: string;
  };
}

export async function login(body: LoginRequestBody): Promise<AuthResponseBody> {
  const data = await post<AuthResponseBody, LoginRequestBody>("/auth/login", body);
  setAccessToken(data.accessToken ?? null);
  return data;
}

export async function signup(body: SignupRequestBody): Promise<AuthResponseBody> {
  const data = await post<AuthResponseBody, SignupRequestBody>("/auth/signup", body);
  setAccessToken(data.accessToken ?? null);
  return data;
}

export function logout(): void {
  setAccessToken(null);
}


