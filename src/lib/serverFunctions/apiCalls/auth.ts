import type { FetchCurrentUserResponse } from "@/lib/serverFunctions/queries/user";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type { LoginResponse, LogoutResponse } from "../mutations/login";
import type {
  RequestPasswordResetResponse,
  ResetPasswordResponse,
} from "../mutations/passwordResetUtil";
import type { RegisterResponse } from "../mutations/register";

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

export const useLogout = (params?: UseFetchAPIParams<LogoutResponse>) => {
  return useFetchAPI<LogoutResponse, Record<string, never>>({
    url: "/api/auth/logout",
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
