// utils/inputRestrictions.ts

// Only letters and spaces (names)
export const lettersOnlyProps = {
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[a-zA-Z\s]/.test(e.key)) e.preventDefault();
  },
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!/^[a-zA-Z\s]+$/.test(text)) e.preventDefault();
  },
};

// Only numbers (mobile, etc.)
export const numbersOnlyProps = {
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => {
    // if (!/[0-9]/.test(e.key)) e.preventDefault();
    const value = e.currentTarget.value;

    // Allow only digits
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
      return;
    }

    // First digit only 6-9
    if (value.length === 0 && !/[6-9]/.test(e.key)) {
      e.preventDefault();
    }
  },
  // First digit only 6-9


  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!/^\d+$/.test(text)) e.preventDefault();
  },
};

// Alphanumeric only (license numbers, ID numbers)
export const alphanumericOnlyProps = {
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[a-zA-Z0-9\-]/.test(e.key)) e.preventDefault();
  },
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!/^[a-zA-Z0-9\-]+$/.test(text)) e.preventDefault();
  },
};

// Letters, numbers, spaces, commas, dots (addresses)
export const addressProps = {
  // onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (!/[a-zA-Z0-9\s,.\-/#]/.test(e.key)) e.preventDefault();
  // },
  // onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
  //   const text = e.clipboardData.getData("text");
  //   if (!/^[a-zA-Z0-9\s,.\-/#]+$/.test(text)) e.preventDefault();
  // },
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!/[A-Za-z0-9\s,./#-]/.test(e.key)) {
      e.preventDefault();
    }
  },

  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");

    if (!/^[A-Za-z0-9\s,./#-]+$/.test(text)) {
      e.preventDefault();
    }
  },
};