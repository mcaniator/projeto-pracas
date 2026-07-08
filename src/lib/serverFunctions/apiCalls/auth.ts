import type { Role } from "@prisma/client";

import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export type CurrentUser = {
  id: string;
  username: string;
  email: string;
  image: string | null;
  active: boolean;
  roles: Role[];
};

export type FetchCurrentUserResponse = {
  user: CurrentUser | null;
};

export type LoginResponse = null;

export type RegisterResponse = {
  errors:
    | {
        message: string | null;
        element: string | null;
      }[]
    | null;
};

export type RequestPasswordResetResponse = null;

export type ResetPasswordResponse = {
  errorMessage: string | null;
};

export const useFetchCurrentUser = (
  params?: UseFetchAPIParams<FetchCurrentUserResponse>,
) => {
  return useFetchAPI<FetchCurrentUserResponse, Record<string, never>>({
    url: "/api/auth/currentUser",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};

export const useLogin = (params?: UseFetchAPIParams<LoginResponse>) => {
  return useFetchAPI<LoginResponse, Record<string, never>>({
    url: "/api/auth/login",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useRegister = (params?: UseFetchAPIParams<RegisterResponse>) => {
  return useFetchAPI<RegisterResponse, Record<string, never>>({
    url: "/api/auth/register",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useRequestPasswordReset = (
  params?: UseFetchAPIParams<RequestPasswordResetResponse>,
) => {
  return useFetchAPI<RequestPasswordResetResponse, Record<string, never>>({
    url: "/api/auth/requestPasswordReset",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useResetPassword = (
  params?: UseFetchAPIParams<ResetPasswordResponse>,
) => {
  return useFetchAPI<ResetPasswordResponse, Record<string, never>>({
    url: "/api/auth/resetPassword",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};
