import { useState, useCallback } from 'react';

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

interface UseModalWithData<T> extends UseModalReturn {
  data: T | null;
  setData: (data: T | null) => void;
  openWithData: (data: T) => void;
}

export function useModalWithData<T>(initialState = false): UseModalWithData<T> {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const openWithData = useCallback((newData: T) => {
    setData(newData);
    setIsOpen(true);
  }, []);

  return { isOpen, data, setData, open, close, toggle, openWithData };
}
