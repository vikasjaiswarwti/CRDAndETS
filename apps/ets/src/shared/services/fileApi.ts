import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../lib/api/baseQueryWithReauth";

export interface UploadFileArgs {
  file: File;
  documentName: string;
}

export interface UploadFileResponse {
  fileName: string;
}

export interface GetFileUrlResponse {
  fileUrl: string;
}

export const fileApi = createApi({
  reducerPath: "fileApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    uploadFile: builder.mutation<UploadFileResponse, UploadFileArgs>({
      query: ({ file, documentName }) => {
        const formData = new FormData();
        formData.append("DocumentName", documentName);
        formData.append("File", file);
        return {
          url: "/api/v1/FileUploads",
          method: "POST",
          body: formData,
          // Do NOT set Content-Type — browser sets multipart boundary automatically
        };
      },
    }),

    getFileUrl: builder.query<GetFileUrlResponse, string>({
      query: (fileName) => ({
        url: `/api/v1/FileUploads/url?fileName=${fileName}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res.fileUrl;
      },
    }),
  }),
});

export const {
  useUploadFileMutation,
  useGetFileUrlQuery,
  useLazyGetFileUrlQuery, // use lazy so you can call on-demand
} = fileApi;
