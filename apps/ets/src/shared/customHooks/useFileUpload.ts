// import {
//   useUploadFileMutation,
//   useLazyGetFileUrlQuery,
//   // useGetFileUrlQuery
// } from "../services/fileApi";

// /**
//  * Custom hook for uploading files and retrieving secure file URLs.
//  *
//  * @returns Object containing:
//  * - uploadAndGetUrl: Uploads a file and returns its accessible URL.
//  * - getFileUrl: Fetches the actual file URL from backend using file name.
//  * - isLoading: Upload loading state.
//  * - error: Upload API error state.
//  */
// export const useFileUpload = () => {
//   const [uploadFileMutation, { isLoading, error }] = useUploadFileMutation();
//   const [triggerGetFileUrl] = useLazyGetFileUrlQuery(); // ✅ called at top level
//   /**
//    * Uploads a file to the server and returns the generated file URL.
//    *
//    * @param file - File object selected by the user.
//    * @param name - Document name or file identifier.
//    * @returns Promise resolving to:
//    * - File URL string on success
//    * - null on failure
//    */
//   const uploadAndGetUrl = async (
//     file: File,
//     name: string,
//   ): Promise<string | null> => {
//     try {
//       const { fileName } = await uploadFileMutation({
//         file,
//         documentName: name,
//       }).unwrap(); // .unwrap() throws on error, no manual try/catch needed for 401

//       // Return the URL string your ImageUpload component stores
//       return `${import.meta.env.VITE_API_BASE_URL_FOR_GET}/api/v1/FileUploads/url?fileName=${fileName}`;
//     } catch {
//       return null;
//     }
//   };
//   /**
//     * Retrieves the actual file URL from backend using file name or URL.
//     *
//     * @param url - Existing file URL or file name.
//     * @returns Promise resolving to:
//     * - Valid file URL string
//     * - "URL Not Found" if request fails
//     */
//   const getFileUrl = async (url: string): Promise<string> => {
//     try {
//       const fileName = new URL(url).searchParams.get("fileName") ?? url;
//       const result = await triggerGetFileUrl(fileName, false).unwrap();
//       console.log(result, "result"); // check what shape this is

//       // Safety: handle both string and object response
//       if (typeof result === "string") return result;
//       if (typeof result === "object" && result !== null && "fileUrl" in result) {
//         return (result as any).fileUrl;
//       }
//       return "URL Not Found";
//     } catch (e) {
//       console.error("getFileUrl failed:", e);
//       return "URL Not Found";
//     }
//   };

//   return {
//     uploadAndGetUrl,
//     getFileUrl,
//     isLoading,
//     error,
//   };
// };

import {
  useUploadFileMutation,
  useLazyGetFileUrlQuery,
} from "../services/fileApi";

/**
 * Constructs the full view URL for a stored fileName path.
 * Use this wherever you need to display / open a file link in the UI.
 *
 * e.g.  "Others/PUC Doc/xxx.jpg"
 *   →   "http://host/api/v1/FileUploads/url?fileName=Others%2FPUC+Doc%2Fxxx.jpg"
 */
export const buildFileViewUrl = (fileName: string): string =>
  `${import.meta.env.VITE_API_BASE_URL_FOR_GET}/api/v1/FileUploads/url?fileName=${encodeURIComponent(fileName)}`;

/**
 * Resolves a stored doc value to a displayable URL.
 * Handles both:
 *   - Legacy full URLs (already starts with http/https) → returned as-is
 *   - New relative fileName paths                       → wrapped with buildFileViewUrl
 */
export const resolveFileUrl = (
  stored: string | null | undefined,
): string | null => {
  if (!stored) return null;
  if (stored.startsWith("http://") || stored.startsWith("https://"))
    return stored;
  return buildFileViewUrl(stored);
};

/**
 * Custom hook for uploading files and retrieving secure file URLs.
 *
 * uploadAndGetUrl returns the raw `fileName` path from the upload API response
 * (e.g. "Others/PUC Doc/abc.jpg"). This is what you store in state and submit
 * to the backend. Use resolveFileUrl / buildFileViewUrl when you need a
 * clickable href for the browser.
 */
export const useFileUpload = () => {
  const [uploadFileMutation, { isLoading, error }] = useUploadFileMutation();
  const [triggerGetFileUrl] = useLazyGetFileUrlQuery();

  /**
   * Uploads a file and returns the raw fileName path from the API response.
   * Returns null on failure.
   */
  const uploadAndGetUrl = async (
    file: File,
    name: string,
  ): Promise<string | null> => {
    try {
      const { fileName } = await uploadFileMutation({
        file,
        documentName: name,
      }).unwrap();

      // ✅ Return the raw path — NOT a constructed URL.
      // The backend stores this value; build the view URL on-the-fly with
      // resolveFileUrl() or buildFileViewUrl() when rendering <a href>.
      return fileName;
    } catch {
      return null;
    }
  };

  /**
   * Fetches a short-lived signed / resolved URL from the backend.
   * Accepts either a raw fileName or a legacy full URL with ?fileName= param.
   */
  const getFileUrl = async (stored: string): Promise<string> => {
    try {
      // Accept both raw paths and legacy full URLs
      let fileName = stored;
      try {
        const parsed = new URL(stored);
        fileName = parsed.searchParams.get("fileName") ?? stored;
      } catch {
        /* stored is already a raw path */
      }

      const result = await triggerGetFileUrl(fileName, false).unwrap();

      if (typeof result === "string") return result;
      if (
        typeof result === "object" &&
        result !== null &&
        "fileUrl" in result
      ) {
        return (result as any).fileUrl;
      }
      return "URL Not Found";
    } catch (e) {
      console.error("getFileUrl failed:", e);
      return "URL Not Found";
    }
  };

  return { uploadAndGetUrl, getFileUrl, isLoading, error };
};
