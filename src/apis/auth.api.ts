import { TAuthResponse } from "src/types/auth-response.types";
import http from "src/utils/http";

export enum AUTH_ENUM {
  URL_LOGIN = "/login",
  URL_REGISTER = "/register",
  URL_LOGOUT = "/logout",
  URL_REFRESHTOKEN = "/refresh-access-token",
}

const authApi = {
  registerAccount: (body: { email: string; password: string }) =>
    http.post<TAuthResponse>(AUTH_ENUM.URL_REGISTER, body),
  loginAccount: (body: { email: string; password: string }) => http.post<TAuthResponse>(AUTH_ENUM.URL_LOGIN, body),
  logoutAccount: () => http.post(AUTH_ENUM.URL_LOGOUT),
  forgotPassword: (body: { email: string }) => http.post("/forgot-password", body),
  resetPassword: (body: { email: string; otp: string; newPassword: string }) =>
    http.post("/reset-password", body),
};

export default authApi;
