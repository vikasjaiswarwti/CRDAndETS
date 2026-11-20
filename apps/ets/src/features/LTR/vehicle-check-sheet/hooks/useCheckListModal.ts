// FILE 6 — hooks/useStateModal.ts

import { useState, useCallback } from 'react';
// import type {} from "../types/"

export const useCheckListModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openCreate = useCallback(() => {
   
    setIsOpen(true);
  }, []);


  const close = useCallback(() => {
    setIsOpen(false);
 
  }, []);

  return { isOpen, openCreate, close };
};