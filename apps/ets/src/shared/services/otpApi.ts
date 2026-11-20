import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../lib/api/baseQueryWithReauth"; // adjust path

export type OtpRequestType = "MOBILE_UPDATE" | "REGISTRATION" | string;

export interface SendOtpPayload {
  mobileNo: string;
  requestType: OtpRequestType;
}

export interface VerifyOtpPayload {
  mobileNo: string;
  otp: number;
  requestType: OtpRequestType;
}

export interface OtpApiResponse {
  success: boolean;
  message?: string;
}

export const otpApi = createApi({
  reducerPath: "otpApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    sendOtp: builder.mutation<OtpApiResponse, SendOtpPayload>({
      query: (body) => ({
        url: "/api/v1/Otp/send",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation<OtpApiResponse, VerifyOtpPayload>({
      query: (body) => ({
        url: "/api/v1/Otp/verify",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSendOtpMutation, useVerifyOtpMutation } = otpApi;
