// utils/uploadValidation.ts

import { message, Upload } from "antd";

export const MAX_FILE_SIZE_MB = Number(
  import.meta.env.VITE_MAX_FILE_SIZE_MB || 20
);
export const validateFileSize = (file: File) => {
  const isValidSize =
    file.size / 1024 / 1024 <= MAX_FILE_SIZE_MB;

  if (!isValidSize) {
    message.error(
      `File size must be less than ${MAX_FILE_SIZE_MB}MB`
    );

    return false;
  }

  return true;
};
export const beforeUpload = (file: File) => {
  const isValidSize =
    file.size / 1024 / 1024 <= MAX_FILE_SIZE_MB;

  if (!isValidSize) {
    message.error(
      `File size must be less than ${MAX_FILE_SIZE_MB}MB`
    );

    return Upload.LIST_IGNORE;
  }

  return false;
};