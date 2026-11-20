import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useUILibrary } from "../../lib/ui-lib/ui-library-context";
import { searchInputStyle, searchIcon } from "./searchCSS";
export const useDebouncedCallback = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

const SearchInput: React.FC<{
  placeholder?: string;
  handleSearch: (e: any) => void;
  isNumbersOnly?: boolean;
  isLettersOnly?: boolean;
  isAlphaNumeric?: boolean;
  maxLength?: number;
  width?: number;
  isNoSpecialChars?: boolean;
  labelHide?: boolean;
  labelContent?: string;
}> = ({
  placeholder = "Search...",
  handleSearch,
  isLettersOnly = false,
  isNumbersOnly = false,
  isAlphaNumeric = false,
  maxLength = 20,
  width = 200,
  isNoSpecialChars = true,
  labelHide = false,
  labelContent = "",
}) => {
  const { Input } = useUILibrary();
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const trimmedValue = value.trim();
    // Reset search when input is cleared
    if (trimmedValue.length === 0) {
      handleSearch("");
      return;
    }

    // Minimum 3 characters
    if (trimmedValue.length >= 3) {
      handleSearch(trimmedValue);
    }
  }, 500);
  const containerStyle = useMemo(() => ({ width }), [width]);
  return (
    <div style={containerStyle}>
      {labelHide && (
        <label className="block text-xs font-medium text-gray-700 mb-3">
         {labelContent !="" ? labelContent : placeholder}
        </label>
      )}
      <Input
        placeholder={placeholder}
        allowClear
        prefix={searchIcon}
        maxLength={maxLength}
        onChange={(e) => debouncedSearch(e.target.value)}
        style={searchInputStyle}
        {...getValidationProps({
          isLettersOnly: isLettersOnly,
          isNumbersOnly: isNumbersOnly,
          isAlphaNumeric: isAlphaNumeric,
          isNoSpecialChars,
        })}
      />
    </div>
  );
};

export default React.memo(SearchInput);

interface ValidationOptions {
  isLettersOnly?: boolean;
  isNumbersOnly?: boolean;
  isAlphaNumeric?: boolean;
  isAddress?: boolean;
  isLandline?: boolean;
  isNoSpecialChars?: boolean;
}

export const getValidationProps = ({
  isLettersOnly,
  isNumbersOnly,
  isAlphaNumeric,
  isAddress,
  isLandline,
  isNoSpecialChars,
}: ValidationOptions) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
  ];

  let keyRegex = /.*/;
  // let pasteRegex = /.*/;

  if (isLettersOnly) {
    keyRegex = /^[a-zA-Z\s]$/;
    // pasteRegex = /^[a-zA-Z\s]+$/;
  }

  if (isNumbersOnly) {
    keyRegex = /^[0-9]$/;
    // pasteRegex = /^\d+$/;
  }

  if (isAlphaNumeric) {
    keyRegex = /^[a-zA-Z0-9-]$/;
    // pasteRegex = /^[a-zA-Z0-9-]+$/;
  }

  if (isAddress) {
    keyRegex = /^[A-Za-z0-9\s,./#-]$/;
    // pasteRegex = /^[A-Za-z0-9\s,./#-]+$/;
  }

  if (isLandline) {
    keyRegex = /^[0-9 -]$/;
    // pasteRegex = /^[0-9 -]+$/;
  }
  // Inside the function, after the existing if-blocks:
  if (isNoSpecialChars) {
    keyRegex = /^[a-zA-Z0-9\s\-_]$/; // letters, digits, space, hyphen, underscore
    // pasteRegex = /^[a-zA-Z0-9\s\-_]+$/;
  }

  return {
    onKeyPress: (
      e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
        return;
      }

      // mobile first digit validation
      if (isNumbersOnly) {
        const value = e.currentTarget.value;

        if (value.length === 0 && !/[6-9]/.test(e.key)) {
          e.preventDefault();
          return;
        }
      }

      if (!keyRegex.test(e.key)) {
        e.preventDefault();
      }
    },
    // onPaste: (
    //   e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    // ) => {
    //   const text = e.clipboardData.getData("text");

    //   if (!pasteRegex.test(text)) {
    //     e.preventDefault();
    //   }
    // },
  };
};
