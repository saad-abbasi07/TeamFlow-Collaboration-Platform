import { apiFetch } from "./apiClient";

type AuthPayload = {
  _id: string;
  name: string;
  email: string;
  token: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export const loginUser = async (input: LoginInput) => {
  return apiFetch<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  }, { auth: false });
};

export const registerUser = async (input: RegisterInput) => {
  return apiFetch<AuthPayload>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  }, { auth: false });
};
